import { getPrisma } from '../db';
import { inMemoryPaymentTransactions, pendingJtPayments } from '../../server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { inMemoryUsers, authStore } from '../authStore';

// Get access token securely
const getMPClient = () => {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;
  return new MercadoPagoConfig({ accessToken: token });
};

export class PaymentReconciliationService {
  /**
   * Reconcile all pending payment transactions in the system.
   * Fetches pending logs from local cache & db, checks with Mercado Pago API, and updates/delivers JT coins instantly.
   */
  static async reconcilePendingPayments(actorId: string = 'SYSTEM', ip: string = '127.0.0.1', userAgent: string = 'internal-cron'): Promise<any> {
    const timestamp = new Date().toISOString();
    console.log(`[RECONCILIATION START] Initiated by [${actorId}] from IP [${ip}] at [${timestamp}]`);
    
    const prisma = getPrisma();
    let pendingTxList: any[] = [];

    // 1. Load pending transactions from database
    if (prisma) {
      try {
        pendingTxList = await prisma.paymentTransaction.findMany({
          where: {
            status: 'PENDING',
            processed: false
          }
        });
      } catch (dbErr) {
        console.warn('[RECONCILIATION] DB findMany paymentTransaction failed, using memory state:', dbErr);
      }
    }

    // 2. Load pending transactions from in-memory backup state
    const memList = Array.from(inMemoryPaymentTransactions.values()).filter(t => t.status === 'PENDING' && !t.processed);
    for (const memTx of memList) {
      if (!pendingTxList.some(dbTx => dbTx.mercadoPagoId === memTx.mercadoPagoId)) {
        pendingTxList.push(memTx);
      }
    }

    console.log(`[RECONCILIATION] Found ${pendingTxList.length} pending transaction(s) to verify.`);

    const report = {
      reconciledCount: 0,
      approvedCount: 0,
      unprocessedCount: 0,
      divergencesFixed: 0,
      details: [] as any[]
    };

    const client = getMPClient();

    for (const tx of pendingTxList) {
      try {
        let liveStatus = 'pending';
        let isApproved = false;
        let payerEmail = '';
        let payerName = '';

        if (client && !tx.mercadoPagoId.startsWith('mp_direct_fallback_') && !tx.mercadoPagoId.startsWith('mp_jt_')) {
          // Consult Mercado Pago real API
          const paymentInstance = new Payment(client);
          const mpResponse = await paymentInstance.get({ id: Number(tx.mercadoPagoId) });
          liveStatus = mpResponse.status || 'pending';
          payerEmail = mpResponse.payer?.email || '';
          payerName = `${mpResponse.payer?.first_name || ''} ${mpResponse.payer?.last_name || ''}`.trim();
          
          if (liveStatus === 'approved' || liveStatus === 'completed') {
            isApproved = true;
          }
        } else {
          // For fallback simulated sessions, if PIX copy paste or transaction was marked approved
          // or is old, we can inspect if it's approved in memory or simulate random offline payment completion (e.g. 5% chance or manual admin trigger)
          if (tx.status === 'approved' || tx.processed) {
            isApproved = true;
            liveStatus = 'approved';
          }
        }

        if (isApproved) {
          report.approvedCount++;
          
          // CRITICAL: Idempotência check with atomic database transition to prevent parallel race conditions!
          let alreadyProcessed = false;
          if (prisma) {
            try {
              const freshTx = await prisma.paymentTransaction.findUnique({
                where: { mercadoPagoId: tx.mercadoPagoId }
              });
              if (!freshTx) {
                const memFreshTx = inMemoryPaymentTransactions.get(tx.mercadoPagoId);
                if (!memFreshTx) {
                  console.warn(`[RECONCILIATION FRAUD BLOCKED] Uninitiated transaction ${tx.mercadoPagoId} rejected.`);
                  continue;
                }
              }

              const updateCount = await prisma.paymentTransaction.updateMany({
                where: { mercadoPagoId: tx.mercadoPagoId, processed: false },
                data: { status: 'approved', processed: true }
              });
              if (updateCount.count === 0) {
                alreadyProcessed = true;
              }
            } catch (errCheck) {
              console.error("[RECONCILIATION IDEMPOTENCY ERR] Database checking failed, using safety memory check:", errCheck);
              const memFreshTx = inMemoryPaymentTransactions.get(tx.mercadoPagoId);
              if (memFreshTx && memFreshTx.processed) {
                alreadyProcessed = true;
              }
            }
          } else {
            const memFreshTx = inMemoryPaymentTransactions.get(tx.mercadoPagoId);
            if (memFreshTx && memFreshTx.processed) {
              alreadyProcessed = true;
            }
          }

          if (alreadyProcessed) {
            console.log(`[RECONCILIATION IDEMPOTÈNCIA] Transaction ${tx.mercadoPagoId} already processed (atomic state check). Skipping double balance credit.`);
            continue;
          }

          // Mark as processed & approved in local cache
          const memFreshTx = inMemoryPaymentTransactions.get(tx.mercadoPagoId);
          if (memFreshTx) {
            memFreshTx.processed = true;
            memFreshTx.status = 'approved';
            inMemoryPaymentTransactions.set(tx.mercadoPagoId, memFreshTx);
          } else {
            inMemoryPaymentTransactions.set(tx.mercadoPagoId, {
              ...tx,
              status: 'approved',
              processed: true,
              updatedAt: new Date()
            });
          }

          // Credit JT Coins to User Wallet
          let credited = false;
          if (prisma) {
            try {
              await prisma.$transaction(async (dbTx) => {
                const userWallet = await dbTx.wallet.findUnique({ where: { userId: tx.userId } });
                if (userWallet) {
                  await dbTx.wallet.update({
                    where: { userId: tx.userId },
                    data: { balanceJT: { increment: tx.amountJT } }
                  });
                } else {
                  await dbTx.wallet.create({
                    data: {
                      userId: tx.userId,
                      balanceJT: tx.amountJT,
                      balanceAvailable: 0,
                      balanceBRL: 0,
                      balancePending: 0,
                      totalEarned: 0,
                      totalWithdrawn: 0
                    }
                  });
                }

                await dbTx.paymentLog.create({
                  data: {
                    provider: 'MERCADOPAGO',
                    transactionId: tx.mercadoPagoId,
                    status: 'COMPLETED',
                    amount: tx.amountBRL,
                    payerEmail: payerEmail || 'athletes@jiuspeak.com.br',
                    payerName: payerName || 'Atleta JiuSpeak'
                  }
                });

                await dbTx.auditLog.create({
                  data: {
                    actorId: tx.userId,
                    action: 'PIX_DEPOSIT',
                    description: `[RECONCILIAÇÃO FINANCEIRA] Pacote de ${tx.amountJT} JT creditado. Transação MP ID: ${tx.mercadoPagoId}.`
                  }
                });
              });
              credited = true;
              report.divergencesFixed++;
            } catch (txnErr) {
              console.error('[RECONCILIATION TX ERR] DB Wallet credit transaction failed, using memStore:', txnErr);
            }
          }

          // Sync with memory user store fallback
          const targetUser = Array.from(inMemoryUsers.values()).find(u => u.id === tx.userId);
          if (targetUser) {
            await authStore.updateUser(tx.userId, {
              coins: (targetUser.coins || 0) + tx.amountJT
            });
            credited = true;
            console.log(`[RECONCILIATION CREDIT SUCCESS] Account @${targetUser.username} virtual coins added successfully: +${tx.amountJT} JT`);
          }

          report.reconciledCount++;
          report.details.push({
            paymentId: tx.mercadoPagoId,
            userId: tx.userId,
            amountBRL: tx.amountBRL,
            amountJT: tx.amountJT,
            scannedStatus: liveStatus,
            reconciled: true,
            credited
          });
        } else {
          report.unprocessedCount++;
          report.details.push({
            paymentId: tx.mercadoPagoId,
            userId: tx.userId,
            amountBRL: tx.amountBRL,
            id: tx.id,
            scannedStatus: liveStatus,
            reconciled: false
          });
        }
      } catch (err: any) {
        console.error(`[RECONCILIATION ERR] Failed checking transaction ${tx.mercadoPagoId}:`, err);
        report.details.push({
          paymentId: tx.mercadoPagoId,
          error: err.message || err
        });
      }
    }

    console.log(`[RECONCILIATION COMPLETE] Successfully swept database. Fixed divergences: ${report.divergencesFixed}`);
    return report;
  }
}
