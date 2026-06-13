import { prisma } from "../../../../../server/db";
import * as fs from "fs";
import * as path from "path";
import { MarketplaceProductStatus, MarketplacePurchaseStatus, TeacherApplicationStatus } from "@prisma/client";

export class AuditService {
  public async getAdminDashboardMetrics() {
    const [
      activeProducts,
      pendingProducts,
      pendingTeachers,
      totalSalesCount,
      escrowLockedCount
    ] = await Promise.all([
      prisma.marketplaceProduct.count({ where: { status: MarketplaceProductStatus.APPROVED, isArchived: false } }),
      prisma.marketplaceProduct.count({ where: { status: MarketplaceProductStatus.PENDING_REVIEW, isArchived: false } }),
      prisma.marketplaceTeacherApplication.count({ where: { status: TeacherApplicationStatus.PENDING } }),
      prisma.marketplacePurchase.count({ where: { status: MarketplacePurchaseStatus.RELEASED } }),
      prisma.marketplacePurchase.count({ where: { status: MarketplacePurchaseStatus.PENDING } })
    ]);

    const aggregateAmountsReleased = await prisma.marketplacePurchase.aggregate({
      where: { status: MarketplacePurchaseStatus.RELEASED },
      _sum: {
        totalEquivalentBRL: true,
        platformCommissionBRL: true
      }
    });

    const aggregateAmountsPending = await prisma.marketplacePurchase.aggregate({
      where: { status: MarketplacePurchaseStatus.PENDING },
      _sum: {
        totalEquivalentBRL: true,
        platformCommissionBRL: true
      }
    });

    return {
      activeProducts,
      pendingProducts,
      pendingTeachers,
      totalSalesCount,
      escrowLockedCount,
      revenueReleasedBRL: Number(aggregateAmountsReleased._sum.platformCommissionBRL || 0),
      volumeReleasedBRL: Number(aggregateAmountsReleased._sum.totalEquivalentBRL || 0),
      revenuePendingBRL: Number(aggregateAmountsPending._sum.platformCommissionBRL || 0),
      volumePendingBRL: Number(aggregateAmountsPending._sum.totalEquivalentBRL || 0)
    };
  }

  public async getTeacherDashboardMetrics(userId: string) {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error("Perfil de professor não localizado.");
    }

    const [
      totalProducts,
      activeProducts,
      reviewsCount
    ] = await Promise.all([
      prisma.marketplaceProduct.count({ where: { profileId: profile.id, isArchived: false } }),
      prisma.marketplaceProduct.count({ where: { profileId: profile.id, status: MarketplaceProductStatus.APPROVED, isArchived: false } }),
      prisma.marketplaceReview.count({ where: { product: { profileId: profile.id } } })
    ]);

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    const aggregateSales = await prisma.marketplacePurchase.aggregate({
      where: {
        product: { profileId: profile.id },
        status: { in: [MarketplacePurchaseStatus.PENDING, MarketplacePurchaseStatus.RELEASED] }
      },
      _sum: {
        priceSpentJT: true,
        teacherNetBRL: true
      },
      _count: true
    });

    return {
      bio: profile.bio,
      academy: profile.academy,
      approved: profile.approved,
      totalProducts,
      activeProducts,
      totalSalesCount: aggregateSales._count || 0,
      totalEarnedJT: aggregateSales._sum.priceSpentJT ? Number(aggregateSales._sum.priceSpentJT) : 0,
      totalEarnedBRL: aggregateSales._sum.teacherNetBRL ? Number(aggregateSales._sum.teacherNetBRL) : 0,
      balanceBRL: wallet ? Number(wallet.balanceBRL) : 0,
      balanceAvailable: wallet ? Number(wallet.balanceAvailable) : 0,
      balancePending: wallet ? Number(wallet.balancePending) : 0,
      reviewsCount
    };
  }

  public async getRawAuditJsonLogs(): Promise<string[]> {
    const logPath = path.join(process.cwd(), "logs", "marketplace-audit.log");
    if (!fs.existsSync(logPath)) {
      return [];
    }

    try {
      const logContent = fs.readFileSync(logPath, "utf8");
      return logContent
        .split("\n")
        .filter(line => line.trim().length > 0)
        .reverse(); // Newest first
    } catch {
      return [];
    }
  }
}

export const auditService = new AuditService();
