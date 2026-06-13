import { Response } from "express";
import { AuthenticatedMarketplaceRequest } from "../middlewares/marketplace-auth.middleware";
import { purchaseService } from "../services/purchase.service";
import { reviewRepository } from "../repositories/review.repository";
import { CreateReviewSchema } from "../dtos/review.dto";
import { PurchaseProductSchema } from "../dtos/purchase.dto";

export class PurchaseController {
  public async purchaseProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const buyer = req.user;
      if (!buyer) {
        return res.status(401).json({ error: "Comprador não autenticado." });
      }

      const { id: productId } = req.params;

      const parseResult = PurchaseProductSchema.safeParse(req.body);
      const telemetry = parseResult.success
        ? parseResult.data
        : { ipAddress: req.ip as string, fingerprint: undefined };

      // Set fallback IP if empty
      if (!telemetry.ipAddress) {
        telemetry.ipAddress = req.ip;
      }

      const result = await purchaseService.purchaseProduct(
        buyer.id,
        productId,
        { name: buyer.name, email: buyer.email },
        telemetry
      );

      return res.status(201).json({
        message: "Compra de produto efetuada e matriculada com sucesso no marketplace.",
        purchase: result.purchase
      });
    } catch (err: any) {
      return res.status(400).json({ error: err.message || "Falha ao completar compra do produto." });
    }
  }

  public async reviewProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Não autenticado." });
      }

      const productId = req.params.productId || req.params.id;
      if (!productId) {
        return res.status(400).json({ error: "ID do produto inválido." });
      }
      const parseResult = CreateReviewSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      // Business rule check: user must be enrolled to rate
      const enrollment = await purchaseService.getEnrollment(user.id, productId);
      if (!enrollment || !enrollment.active) {
        return res.status(403).json({ error: "Apenas alunos inscritos neste curso podem avaliá-lo." });
      }

      const review = await reviewRepository.createOrUpdateReview(
        user.id,
        productId,
        parseResult.data.rating,
        parseResult.data.comment
      );

      return res.json({
        message: "Avaliação publicada com sucesso.",
        review
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao publicar avaliação." });
    }
  }

  public async getProductReviews(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const { productId } = req.params;
      const { page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) || 1 : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) || 10 : 10;

      const reviews = await reviewRepository.getProductReviews(productId, parsedPage, parsedLimit);
      return res.json(reviews);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar avaliações do produto." });
    }
  }

  public async getTeacherSalesLedger(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const teacherProfile = req.teacherProfile;
      if (!teacherProfile) {
        return res.status(403).json({ error: "Apenas professores certificados podem visualizar faturamento." });
      }

      const { page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) || 1 : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) || 10 : 10;

      const items = await purchaseService.listTeacherSales(teacherProfile.id, parsedPage, parsedLimit);
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar faturas de vendas." });
    }
  }
}

export const purchaseController = new PurchaseController();
