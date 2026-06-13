import { prisma } from "../../../../../server/db";
import { MarketplacePurchaseStatus, Prisma } from "@prisma/client";

export class PurchaseRepository {
  public async getPurchaseById(id: string) {
    return await prisma.marketplacePurchase.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { name: true, email: true }
        },
        product: {
          include: {
            teacherProfile: {
              include: {
                user: { select: { id: true, name: true, email: true } }
              }
            }
          }
        }
      }
    });
  }

  public async getEnrollment(userId: string, productId: string) {
    return await prisma.marketplaceEnrollment.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });
  }

  public async createPurchaseTransaction(params: {
    buyerId: string;
    productId: string;
    teacherProfileId: string;
    teacherUserId: string;
    priceSpentJT: number;
    conversionRateUsed: number;
    totalEquivalentBRL: number;
    platformCommissionBRL: number;
    teacherNetBRL: number;
    escrowDays: number;
    releaseDate: Date;
    riskScore: number;
    fraudFlag: boolean;
    ipAddress?: string;
    fingerprint?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Pessimistic lock on buyer wallet
      // Perform a raw select for update on the Wallet record
      const buyerWallets = await tx.$queryRawUnsafe<any[]>(
        'SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE',
        params.buyerId
      );
      if (!buyerWallets || buyerWallets.length === 0) {
        throw new Error("Wallet do comprador não localizada.");
      }
      const buyerWallet = buyerWallets[0];

      // 2. Pessimistic lock on teacher wallet
      const teacherWallets = await tx.$queryRawUnsafe<any[]>(
        'SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE',
        params.teacherUserId
      );
      if (!teacherWallets || teacherWallets.length === 0) {
        throw new Error("Wallet do professor não localizada.");
      }
      const teacherWallet = teacherWallets[0];

      // 3. Validate Balance
      if (buyerWallet.balanceJT < params.priceSpentJT) {
        throw new Error("Saldo de JiuTickets insuficiente.");
      }

      // 4. Check if enrollment already exists
      const existingEnrollment = await tx.marketplaceEnrollment.findUnique({
        where: {
          userId_productId: {
            userId: params.buyerId,
            productId: params.productId
          }
        }
      });
      if (existingEnrollment && existingEnrollment.active) {
        throw new Error("Você já possui acesso a este produto.");
      }

      // 5. Debit JTs from Buyer Wallet
      const updatedBuyerWallet = await tx.wallet.update({
        where: { id: buyerWallet.id },
        data: {
          balanceJT: { decrement: params.priceSpentJT }
        }
      });

      // 6. Credit Pending BRL to Teacher Wallet (wait in escrow)
      const updatedTeacherWallet = await tx.wallet.update({
        where: { id: teacherWallet.id },
        data: {
          balancePending: { increment: new Prisma.Decimal(params.teacherNetBRL) }
        }
      });

      // 7. Core records creation (Purchase in pending escrow state)
      const purchase = await tx.marketplacePurchase.create({
        data: {
          buyerId: params.buyerId,
          productId: params.productId,
          priceSpentJT: params.priceSpentJT,
          conversionRateUsed: new Prisma.Decimal(params.conversionRateUsed),
          totalEquivalentBRL: new Prisma.Decimal(params.totalEquivalentBRL),
          platformCommissionBRL: new Prisma.Decimal(params.platformCommissionBRL),
          teacherNetBRL: new Prisma.Decimal(params.teacherNetBRL),
          status: MarketplacePurchaseStatus.PENDING,
          escrowDays: params.escrowDays,
          releaseDate: params.releaseDate,
          riskScore: params.riskScore,
          fraudFlag: params.fraudFlag,
          ipAddress: params.ipAddress || null,
          fingerprint: params.fingerprint || null
        }
      });

      // 8. Create Enrollment
      await tx.marketplaceEnrollment.upsert({
        where: {
          userId_productId: {
            userId: params.buyerId,
            productId: params.productId
          }
        },
        update: { active: true },
        create: {
          userId: params.buyerId,
          productId: params.productId,
          active: true
        }
      });

      // 9. Increment product sales count
      await tx.marketplaceProduct.update({
        where: { id: params.productId },
        data: { salesCount: { increment: 1 } }
      });

      // 10. Log transaction details (for Buyer and Venda/Teacher pending tracking)
      // Transaction log - Debit JT for buyer
      await tx.transaction.create({
        data: {
          walletId: buyerWallet.id,
          amountJT: -params.priceSpentJT,
          amountBRL: new Prisma.Decimal(0),
          type: "MARKETPLACE_BUY",
          status: "APPROVED",
          description: `Compra do item de marketplace: ID "${params.productId}"`,
          referenceId: purchase.id
        }
      });

      // Transaction log - Credit pending BRL for teacher
      await tx.transaction.create({
        data: {
          walletId: teacherWallet.id,
          amountJT: 0,
          amountBRL: new Prisma.Decimal(params.teacherNetBRL),
          type: "MARKETPLACE_SELL",
          status: "PENDING", // PENDING due to Escrow locks
          description: `Venda do produto ID "${params.productId}" (Saldo bloqueado em escrow)`,
          referenceId: purchase.id
        }
      });

      return { purchase, updatedBuyerWallet, updatedTeacherWallet };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }

  public async getPendingEscrowsToRelease() {
    return await prisma.marketplacePurchase.findMany({
      where: {
        status: MarketplacePurchaseStatus.PENDING,
        releaseDate: {
          lte: new Date()
        }
      },
      include: {
        product: {
          include: {
            teacherProfile: true
          }
        }
      }
    });
  }

  public async releaseEscrow(purchaseId: string) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.marketplacePurchase.findUnique({
        where: { id: purchaseId },
        include: {
          product: {
            include: {
              teacherProfile: true
            }
          }
        }
      });

      if (!purchase) {
        throw new Error("Compra não localizada.");
      }

      if (purchase.status !== MarketplacePurchaseStatus.PENDING) {
        return purchase; // already processed
      }

      const teacherUserId = purchase.product.teacherProfile.userId;
      const teacherWallets = await tx.$queryRawUnsafe<any[]>(
        'SELECT * FROM "Wallet" WHERE "userId" = $1 FOR UPDATE',
        teacherUserId
      );
      if (!teacherWallets || teacherWallets.length === 0) {
        throw new Error("Wallet do professor não localizada para o escrow.");
      }
      const teacherWallet = teacherWallets[0];

      // Update Purchase status to RELEASED
      const updatedPurchase = await tx.marketplacePurchase.update({
        where: { id: purchaseId },
        data: { status: MarketplacePurchaseStatus.RELEASED }
      });

      // Update Wallet: decrement pending, increment available & balanceBRL & totalEarned
      await tx.wallet.update({
        where: { id: teacherWallet.id },
        data: {
          balancePending: { decrement: purchase.teacherNetBRL },
          balanceAvailable: { increment: purchase.teacherNetBRL },
          balanceBRL: { increment: purchase.teacherNetBRL },
          totalEarned: { increment: purchase.teacherNetBRL }
        }
      });

      // Update original Transaction status to APPROVED
      await tx.transaction.updateMany({
        where: {
          walletId: teacherWallet.id,
          referenceId: purchaseId,
          type: "MARKETPLACE_SELL"
        },
        data: { status: "APPROVED" }
      });

      // Create detailed audit log entry inside Transaction for completion of escrow release
      await tx.transaction.create({
        data: {
          walletId: teacherWallet.id,
          amountJT: 0,
          amountBRL: purchase.teacherNetBRL,
          type: "ESCROW_RELEASE",
          status: "APPROVED",
          description: `Liberação de escrow do produto: ID "${purchase.productId}"`,
          referenceId: purchaseId
        }
      });

      return updatedPurchase;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });
  }

  public async getPurchasesByBuyer(buyerId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.marketplacePurchase.count({ where: { buyerId } }),
      prisma.marketplacePurchase.findMany({
        where: { buyerId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: true
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }

  public async getEnrollmentsByUser(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.marketplaceEnrollment.count({ where: { userId, active: true } }),
      prisma.marketplaceEnrollment.findMany({
        where: { userId, active: true },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              teacherProfile: {
                include: {
                  user: { select: { name: true } }
                }
              }
            }
          }
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }

  public async getFinancesByTeacher(profileId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.marketplacePurchase.count({
        where: {
          product: { profileId }
        }
      }),
      prisma.marketplacePurchase.findMany({
        where: {
          product: { profileId }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { name: true, email: true } },
          product: { select: { title: true } }
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }
}

export const purchaseRepository = new PurchaseRepository();
