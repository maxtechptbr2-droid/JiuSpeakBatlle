import { purchaseRepository } from "../repositories/purchase.repository";
import { purchaseService } from "../services/purchase.service";
import { isDatabaseConnected, getPrisma } from "../../../../../server/db";
import { authStore } from "../../../../../server/authStore";
import { MarketplacePurchaseStatus, Prisma } from "@prisma/client";

// Global process-level concurrency lock to enforce strict idempotency
let isCronRunning = false;

// Structured Logger Utility
function logStructured(
  level: "INFO" | "WARN" | "ERROR",
  event: string,
  message: string,
  metadata?: Record<string, any>
) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      module: "MARKETPLACE_CRON",
      event,
      message,
      ...(metadata || {})
    })
  );
}

/**
 * Automatic Escrow Releaser Cron
 * Runs periodically to resolve escrow funds for completed teacher marketplace purchases,
 * synchronizes balances, performs financial reconciliation, and audits for business inconsistencies.
 *
 * @param intervalMs How often to run the routine (default = 1 hour / 3600000ms)
 */
export function initEscrowReleaserCron(intervalMs = 3600000) {
  logStructured(
    "INFO",
    "CRON_INITIALIZED",
    `Iniciando rotina de liquidação e conciliação de do marketplace com intervalo de ${intervalMs}ms.`,
    { intervalMs }
  );

  // Run the first iteration after a 5-second delay to let the app boot completely
  setTimeout(() => {
    runMarketplaceCronRoutine();
  }, 5000);

  // Setup recurring interval execution
  const intervalId = setInterval(() => {
    runMarketplaceCronRoutine();
  }, intervalMs);

  return intervalId;
}

/**
 * Main routine coordinating all periodic marketplace jobs
 */
export async function runMarketplaceCronRoutine() {
  // Idempotency: prevent overlapping executions
  if (isCronRunning) {
    logStructured(
      "WARN",
      "CRON_OVERLAP_SKIPPED",
      "Uma execução da rotina de conciliação do marketplace já está em andamento. Ignorando nova execução para garantir idempotência."
    );
    return;
  }

  if (!isDatabaseConnected()) {
    logStructured(
      "WARN",
      "DATABASE_OFFLINE",
      "Ignorando execução do Cron: Banco de dados não conectado (utilizando modo simulado/em memória)."
    );
    return;
  }

  isCronRunning = true;
  const startTime = Date.now();

  logStructured("INFO", "CRON_RUN_STARTED", "Iniciando ciclo de tarefas automáticas do Marketplace...");

  try {
    // 1. Liberação de Escrow (Escrow Release)
    const escrowResults = await executeEscrowReleaseJob();

    // 2. Atualização de Saldos (Balance Updating / Cache Syncing)
    const syncResults = await executeBalanceUpdatingJob();

    // 3. Conciliação Financeira (Financial Reconciliation)
    const reconciliationResults = await executeFinancialReconciliationJob();

    // 4. Verificação de Inconsistências (Inconsistency Health Checks)
    const inconsistencyResults = await executeInconsistencyJob();

    const durationMs = Date.now() - startTime;
    logStructured(
      "INFO",
      "CRON_RUN_COMPLETED",
      `Ciclo de tarefas concluído com sucesso em ${durationMs}ms.`,
      {
        durationMs,
        metrics: {
          escrowsReleased: escrowResults.releasedCount,
          escrowsFailed: escrowResults.failedCount,
          walletsSynced: syncResults.syncedCount,
          reconciliationErrors: reconciliationResults.discrepanciesCount,
          inconsistenciesFound: inconsistencyResults.inconsistenciesCount
        }
      }
    );
  } catch (err: any) {
    logStructured(
      "ERROR",
      "CRON_RUN_FATAL",
      `Erro fatal inesperado durante o processamento do Cron do Marketplace: ${err.message}`,
      { errorStack: err.stack }
    );
  } finally {
    isCronRunning = false;
  }
}

/**
 * JOB 1: Liberação de Escrow
 * Reconciles and completes purchases that are past their escrow window. Since each
 * individual release runs inside an transaction with pessimistic locks, the operation
 * is highly robust and idempotent.
 */
async function executeEscrowReleaseJob() {
  let releasedCount = 0;
  let failedCount = 0;

  try {
    logStructured("INFO", "ESCROW_RELEASE_STARTED", "Buscando escrows pendentes qualificados para liberação...");
    const pendingEscrows = await purchaseRepository.getPendingEscrowsToRelease();

    if (pendingEscrows.length === 0) {
      logStructured("INFO", "ESCROW_RELEASE_NOOP", "Nenhum escrow pendente elegível para liberação nesta janela.");
      return { releasedCount, failedCount };
    }

    logStructured(
      "INFO",
      "ESCROW_RELEASE_PROCESSING",
      `Localizados ${pendingEscrows.length} escrows vencidos a processar.`,
      { pendingCount: pendingEscrows.length }
    );

    for (const escrow of pendingEscrows) {
      // Re-validate status and lock purchase using serializable transaction inside releaseEscrow
      try {
        logStructured(
          "INFO",
          "ESCROW_INDIVIDUAL_START",
          `Liberando escrow da Compra ID "${escrow.id}" para o Professor "${escrow.product.teacherProfile?.userId}"`,
          {
            purchaseId: escrow.id,
            productId: escrow.productId,
            amountBRL: Number(escrow.teacherNetBRL),
            releaseDate: escrow.releaseDate
          }
        );

        // Run transaction in repository
        await purchaseRepository.releaseEscrow(escrow.id);
        releasedCount++;

        logStructured(
          "INFO",
          "ESCROW_INDIVIDUAL_SUCCESS",
          `Recursos da Compra ID "${escrow.id}" liberados com sucesso.`,
          {
            purchaseId: escrow.id,
            amountBRL: Number(escrow.teacherNetBRL),
            teacherUserId: escrow.product.teacherProfile.userId
          }
        );
      } catch (err: any) {
        failedCount++;
        logStructured(
          "ERROR",
          "ESCROW_INDIVIDUAL_FAILED",
          `Erro ao liberar escrow da Compra ID "${escrow.id}": ${err.message}`,
          {
            purchaseId: escrow.id,
            teacherUserId: escrow.product.teacherProfile?.userId,
            error: err.stack || err.message
          }
        );
      }
    }
  } catch (err: any) {
    logStructured(
      "ERROR",
      "ESCROW_RELEASE_JOB_FAILED",
      `Falha geral no job de liberação de escrow: ${err.message}`
    );
  }

  return { releasedCount, failedCount };
}

/**
 * JOB 2: Atualização de Saldos
 * Ensures complete synchronization between physical database wallet fields and the dual-engine memory cache
 * (`authStore` memory-cached models).
 */
async function executeBalanceUpdatingJob() {
  let syncedCount = 0;
  try {
    logStructured("INFO", "BALANCE_SYNC_STARTED", "Iniciando atualização/sincronização de saldos de carteiras com cache em memória...");
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error("Cliente Prisma indisponível");
    }

    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    for (const wallet of wallets) {
      try {
        const availableBRL = Number(wallet.balanceAvailable);
        const pendingBRL = Number(wallet.balancePending);
        const earnedBRL = Number(wallet.totalEarned);
        const withdrawnBRL = Number(wallet.totalWithdrawn);

        // Standardize dual-engine state by updating the session cache with actual DB numbers
        await authStore.updateUser(wallet.userId, {
          coins: wallet.balanceJT,
          balanceAvailableBRL: availableBRL,
          balancePendingBRL: pendingBRL,
          totalEarnedBRL: earnedBRL,
          totalWithdrawnBRL: withdrawnBRL
        });

        syncedCount++;
      } catch (err: any) {
        logStructured(
          "WARN",
          "BALANCE_SYNC_INDIVIDUAL_WARN",
          `Erro pontual ao atualizar usuário "${wallet.userId}" no cache do authStore: ${err.message}`,
          { userId: wallet.userId }
        );
      }
    }

    logStructured(
      "INFO",
      "BALANCE_SYNC_COMPLETED",
      `Sincronização concluída com sucesso. ${syncedCount} carteiras alinhadas entre Banco e Memória.`,
      { syncedCount }
    );
  } catch (err: any) {
    logStructured(
      "ERROR",
      "BALANCE_SYNC_FAILED",
      `Falha geral no job de sincronização de saldos: ${err.message}`
    );
  }
  return { syncedCount };
}

/**
 * JOB 3: Conciliação Financeira
 * Walks through each active user/teacher's wallet, aggregates all source transaction ledgers
 * and raw purchases to double-check their mathematical consistency with current balance state fields.
 */
async function executeFinancialReconciliationJob() {
  let checkedCount = 0;
  let discrepanciesCount = 0;

  try {
    logStructured("INFO", "FINANCIAL_RECONCILIATION_STARTED", "Iniciando conciliação de faturamento transacional...");
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error("Cliente Prisma indisponível");
    }

    // Fetch all wallets to audit their stored balance fields against raw transactions
    const wallets = await prisma.wallet.findMany({
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    for (const wallet of wallets) {
      checkedCount++;
      const userId = wallet.userId;

      // 1. Audit Purchases released/pending matching teacher sales
      // Locate products owned by this teacher
      const teacherProducts = await prisma.marketplaceProduct.findMany({
        where: {
          teacherProfile: { userId }
        },
        select: { id: true, title: true }
      });

      const productIds = teacherProducts.map(p => p.id);

      // Aggregate purchases for these products
      let dbReleasedNet = new Prisma.Decimal(0);
      let dbPendingNet = new Prisma.Decimal(0);

      if (productIds.length > 0) {
        const releasedSum = await prisma.marketplacePurchase.aggregate({
          where: {
            productId: { in: productIds },
            status: MarketplacePurchaseStatus.RELEASED
          },
          _sum: { teacherNetBRL: true }
        });
        dbReleasedNet = releasedSum._sum.teacherNetBRL || new Prisma.Decimal(0);

        const pendingSum = await prisma.marketplacePurchase.aggregate({
          where: {
            productId: { in: productIds },
            status: MarketplacePurchaseStatus.PENDING
          },
          _sum: { teacherNetBRL: true }
        });
        dbPendingNet = pendingSum._sum.teacherNetBRL || new Prisma.Decimal(0);
      }

      // 2. Audit Withdrawals matching total withdrawn
      const withdrawalsSum = await prisma.withdrawal.aggregate({
        where: {
          walletId: wallet.id,
          status: "COMPLETED"
        },
        _sum: { amountBRL: true }
      });
      const dbWithdrawalsTotal = withdrawalsSum._sum.amountBRL || new Prisma.Decimal(0);

      // Discrepancy checks
      const totalEarnedMismatch = !wallet.totalEarned.equals(dbReleasedNet);
      const balancePendingMismatch = !wallet.balancePending.equals(dbPendingNet);
      const totalWithdrawnMismatch = !wallet.totalWithdrawn.equals(dbWithdrawalsTotal);

      if (totalEarnedMismatch || balancePendingMismatch || totalWithdrawnMismatch) {
        discrepanciesCount++;
        logStructured(
          "WARN",
          "FINANCIAL_DISCREPANCY_DETECTED",
          `Divergência de valores detectada para o usuário "${wallet.user.name}" (ID: ${userId})!`,
          {
            userId,
            userEmail: wallet.user.email,
            walletId: wallet.id,
            earnings: {
              storedWalletTotalEarned: Number(wallet.totalEarned),
              computedFromPurchases: Number(dbReleasedNet),
              mismatch: totalEarnedMismatch
            },
            pending: {
              storedWalletBalancePending: Number(wallet.balancePending),
              computedFromPurchases: Number(dbPendingNet),
              mismatch: balancePendingMismatch
            },
            withdrawals: {
              storedWalletTotalWithdrawn: Number(wallet.totalWithdrawn),
              computedFromWithdrawals: Number(dbWithdrawalsTotal),
              mismatch: totalWithdrawnMismatch
            }
          }
        );

        // Safe self-healing block: auto-resolve database discrepancy to prevent broken states
        try {
          await prisma.$transaction(async (tx) => {
            // Apply correction so other service layers are perfectly consistent
            await tx.wallet.update({
              where: { id: wallet.id },
              data: {
                totalEarned: dbReleasedNet,
                balancePending: dbPendingNet,
                totalWithdrawn: dbWithdrawalsTotal
              }
            });

            logStructured(
              "INFO",
              "FINANCIAL_AUTO_REPAIR_SUCCESS",
              `Ajuste de saldo automático executado com sucesso para a carteira ID "${wallet.id}".`,
              { walletId: wallet.id }
            );
          });
        } catch (repairErr: any) {
          logStructured(
            "ERROR",
            "FINANCIAL_AUTO_REPAIR_FAILED",
            `Falha ao aplicar reparo de faturamento automático na carteira "${wallet.id}": ${repairErr.message}`
          );
        }
      }
    }

    logStructured(
      "INFO",
      "FINANCIAL_RECONCILIATION_COMPLETED",
      `Conciliação de faturamento finalizada. Analisados ${checkedCount} extratos de carteiras. Inconsistências reparadas: ${discrepanciesCount}.`,
      { checkedCount, discrepanciesCount }
    );
  } catch (err: any) {
    logStructured(
      "ERROR",
      "FINANCIAL_RECONCILIATION_FAILED",
      `Falha geral no job de conciliação financeira: ${err.message}`
    );
  }

  return { checkedCount, discrepanciesCount };
}

/**
 * JOB 4: Verificação de Inconsistências
 * System health-checks that locate business issues such as negative balances, active enrollments without
 * a paid purchase reference, or payouts that are stuck in PENDING state for over 3 days.
 */
async function executeInconsistencyJob() {
  let inconsistenciesCount = 0;

  try {
    logStructured("INFO", "INCONSISTENCY_AUDIT_STARTED", "Vasculhando base de faturamento em busca de anomalias operacionais...");
    const prisma = getPrisma();
    if (!prisma) {
      throw new Error("Cliente Prisma indisponível");
    }

    // A. Detect Negative balances
    const negativeBalanceWallets = await prisma.wallet.findMany({
      where: {
        OR: [
          { balanceAvailable: { lt: 0 } },
          { balancePending: { lt: 0 } },
          { balanceJT: { lt: 0 } }
        ]
      },
      include: { user: { select: { name: true, email: true } } }
    });

    if (negativeBalanceWallets.length > 0) {
      for (const w of negativeBalanceWallets) {
        inconsistenciesCount++;
        logStructured(
          "ERROR",
          "ANOMALY_NEGATIVE_BALANCE",
          `Carteira ID "${w.id}" do usuário "${w.user.name}" possui valores negativos de créditos!`,
          {
            userId: w.userId,
            userEmail: w.user.email,
            balanceJT: w.balanceJT,
            balanceAvailable: Number(w.balanceAvailable),
            balancePending: Number(w.balancePending)
          }
        );
      }
    }

    // B. Detect Active Enrollments with Missing Purchases (Bypasses or illegal course access)
    const activeEnrollments = await prisma.marketplaceEnrollment.findMany({
      where: { active: true },
      include: {
        product: { select: { title: true } },
        user: { select: { name: true, email: true } }
      }
    });

    for (const enrollment of activeEnrollments) {
      // Look for a successful purchase (PENDING or RELEASED)
      const correspondingPurchase = await prisma.marketplacePurchase.findFirst({
        where: {
          buyerId: enrollment.userId,
          productId: enrollment.productId,
          status: { in: [MarketplacePurchaseStatus.PENDING, MarketplacePurchaseStatus.RELEASED] }
        }
      });

      if (!correspondingPurchase) {
        inconsistenciesCount++;
        logStructured(
          "WARN",
          "ANOMALY_ORPHAN_ENROLLMENT",
          `Garantia Anti-Burlar: Usuário "${enrollment.user.name}" possui acesso ativo ao produto "${enrollment.product.title}" mas nenhuma transação de faturamento foi registrada!`,
          {
            userId: enrollment.userId,
            userEmail: enrollment.user.email,
            productId: enrollment.productId,
            productTitle: enrollment.product.title
          }
        );
      }
    }

    // C. Detect Long Stalemate Withdrawals (Pending/unreviewed withdrawals for over 3 days)
    const criticalStaleDate = new Date();
    criticalStaleDate.setDate(criticalStaleDate.getDate() - 3);

    const stuckWithdrawals = await prisma.withdrawal.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: criticalStaleDate }
      },
      include: {
        wallet: { include: { user: { select: { name: true } } } }
      }
    });

    if (stuckWithdrawals.length > 0) {
      for (const sw of stuckWithdrawals) {
        inconsistenciesCount++;
        logStructured(
          "WARN",
          "ANOMALY_STUCK_WITHDRAWAL",
          `Solicitação de saque pendente há mais de 3 dias necessita de atenção urgente! Saque ID "${sw.id}"`,
          {
            withdrawalId: sw.id,
            user: sw.wallet?.user?.name,
            amountBRL: Number(sw.amountBRL),
            createdAt: sw.createdAt
          }
        );
      }
    }

    logStructured(
      "INFO",
      "INCONSISTENCY_AUDIT_COMPLETED",
      `Varredura de anomalias concluída. Total de ocorrências detectadas: ${inconsistenciesCount}`,
      { inconsistenciesCount }
    );
  } catch (err: any) {
    logStructured(
      "ERROR",
      "INCONSISTENCY_AUDIT_FAILED",
      `Falha geral no job de verificação de inconsistências: ${err.message}`
    );
  }

  return { inconsistenciesCount };
}
