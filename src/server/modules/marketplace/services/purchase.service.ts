import { purchaseRepository } from "../repositories/purchase.repository";
import { productRepository } from "../repositories/product.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { marketplaceEmitter } from "../events/event-emitter";
import { MarketplaceProductStatus, MarketplacePurchaseStatus } from "@prisma/client";

// Simple in-memory tracker for purchase velocity limits
interface PurchaseAttempt {
  timestamp: number;
}
const recentAttempts = new Map<string, PurchaseAttempt[]>();

export class PurchaseService {
  public async getPurchaseById(id: string) {
    return await purchaseRepository.getPurchaseById(id);
  }

  public async getEnrollment(userId: string, productId: string) {
    return await purchaseRepository.getEnrollment(userId, productId);
  }

  public async listStudentEnrollments(userId: string, page = 1, limit = 10) {
    return await purchaseRepository.getEnrollmentsByUser(userId, page, limit);
  }

  public async listStudentPurchases(userId: string, page = 1, limit = 10) {
    return await purchaseRepository.getPurchasesByBuyer(userId, page, limit);
  }

  public async listTeacherSales(profileId: string, page = 1, limit = 10) {
    return await purchaseRepository.getFinancesByTeacher(profileId, page, limit);
  }

  public async purchaseProduct(
    buyerId: string,
    productId: string,
    actor: { name: string; email: string },
    telemetry: { ipAddress?: string; fingerprint?: string }
  ) {
    // 1. Load targets
    const product = await productRepository.getProductById(productId);
    if (!product) {
      throw new Error(`Produto com ID ${productId} não localizado.`);
    }

    if (product.status !== MarketplaceProductStatus.APPROVED || product.isArchived) {
      throw new Error("Este produto não está ativo ou disponível para compra no momento.");
    }

    const teacherUserId = product.teacherProfile.userId;

    // 2. Anti-fraud checks
    // Check A: Self-buying block
    if (buyerId === teacherUserId) {
      throw new Error("Não é permitido adquirir seus próprios conteúdos publicados.");
    }

    // Check B: Velocity rate check for risk scoring
    let riskScore = 0;
    let fraudFlag = false;
    const now = Date.now();
    const clientKey = telemetry.fingerprint || telemetry.ipAddress || buyerId;

    if (clientKey) {
      let attempts = recentAttempts.get(clientKey) || [];
      // prune attempts older than 2 minutes (120000ms)
      attempts = attempts.filter(a => now - a.timestamp < 120000);
      
      if (attempts.length >= 3) {
        riskScore += 4; // high frequency multiplier
      }
      if (attempts.length >= 5) {
        riskScore += 5; // potential automated abuse
        fraudFlag = true; // automatic flag
      }

      attempts.push({ timestamp: now });
      recentAttempts.set(clientKey, attempts);
    }

    // 3. Load global settings for rates and commissions
    const settings = await settingsRepository.getSettings();
    const rateUsed = Number(settings.jtToBrlConversionRate);
    const commissionPct = Number(settings.defaultPlatformCommission);
    const escrowDays = settings.escrowDays;

    const priceSpentJT = product.priceJT;
    const totalEquivalentBRL = Number((priceSpentJT * rateUsed).toFixed(2));
    const platformCommissionBRL = Number(((totalEquivalentBRL * commissionPct) / 100).toFixed(2));
    const teacherNetBRL = Number((totalEquivalentBRL - platformCommissionBRL).toFixed(2));

    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + escrowDays);

    // 4. Run Transaction Database Actions
    const result = await purchaseRepository.createPurchaseTransaction({
      buyerId,
      productId,
      teacherProfileId: product.profileId,
      teacherUserId,
      priceSpentJT,
      conversionRateUsed: rateUsed,
      totalEquivalentBRL,
      platformCommissionBRL,
      teacherNetBRL,
      escrowDays,
      releaseDate,
      riskScore,
      fraudFlag,
      ipAddress: telemetry.ipAddress,
      fingerprint: telemetry.fingerprint
    });

    // 5. Emit Event
    marketplaceEmitter.emitMarketplaceEvent(
      "PURCHASE_COMPLETED",
      { id: buyerId, name: actor.name, email: actor.email },
      {
        purchaseId: result.purchase.id,
        productId,
        productTitle: product.title,
        priceSpentJT,
        totalEquivalentBRL,
        teacherProfileId: product.profileId,
        teacherUserId
      },
      {
        ipAddress: telemetry.ipAddress || null,
        fingerprint: telemetry.fingerprint || null,
        riskScore
      }
    );

    return result;
  }

  public async runPendingEscrowReconciliation() {
    const list = await purchaseRepository.getPendingEscrowsToRelease();
    let count = 0;

    for (const item of list) {
      try {
        await purchaseRepository.releaseEscrow(item.id);
        count++;

        // Emit released event
        marketplaceEmitter.emitMarketplaceEvent(
          "ESCROW_RELEASED",
          { id: "system_cron", name: "Escrow Automático Releaser", email: "system@jiuspeak.com" },
          {
            purchaseId: item.id,
            productId: item.productId,
            teacherNetBRL: Number(item.teacherNetBRL),
            teacherUserId: item.product.teacherProfile.userId
          }
        );
      } catch (err) {
        console.error(`[CRON ERROR] Falha ao liquidar escrow da compra ID ${item.id}:`, err);
      }
    }

    return count;
  }
}

export const purchaseService = new PurchaseService();
