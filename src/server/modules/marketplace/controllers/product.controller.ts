import { Response } from "express";
import { AuthenticatedMarketplaceRequest } from "../middlewares/marketplace-auth.middleware";
import { productService } from "../services/product.service";
import { CreateProductSchema, JudgeProductSchema, UpdateProductSchema } from "../dtos/product.dto";
import { MarketplaceProductStatus, MarketplaceProductType } from "@prisma/client";

export class ProductController {
  // Public
  public async getCategories(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const categories = await productService.getCategories();
      return res.json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar categorias." });
    }
  }

  public async getProductDetails(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Produto não encontrado." });
      }

      // Hide lessons list details (video urls & files) if comprador hasn't bought it yet
      // unless user is the teacher or an admin
      let parsedProduct = { ...product } as any;
      const isOwner = req.user && product.teacherProfile.userId === req.user.id;
      const isAdmin = req.user && ["ADMIN", "SUPER_ADMIN"].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        // Here we could strip videoUrl or restrict file download unless they have enrollment,
        // we'll handle this in the purchase/enrollment checking.
        // For simplicity, strip download files unless owner/admin.
        parsedProduct.files = [];
      }

      return res.json(parsedProduct);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar detalhes do produto." });
    }
  }

  public async listApprovedProducts(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const { categoryId, type, search, page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) || 1 : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) || 10 : 10;
      
      const items = await productService.listProducts({
        categoryId: categoryId as string,
        type: type as MarketplaceProductType,
        status: MarketplaceProductStatus.APPROVED,
        search: search as string,
        isArchived: false,
        page: parsedPage,
        limit: parsedLimit
      });

      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao buscar produtos." });
    }
  }

  // Teacher Only
  public async createProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const parseResult = CreateProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const product = await productService.createProduct(
        actor.id,
        { name: actor.name, email: actor.email },
        parseResult.data
      );

      return res.status(201).json({
        message: "Rascunho de produto do marketplace do professor criado com sucesso.",
        product
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao criar produto." });
    }
  }

  public async updateProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { id } = req.params;
      const parseResult = UpdateProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const updated = await productService.updateProduct(
        id,
        actor.id,
        { name: actor.name, email: actor.email },
        parseResult.data
      );

      return res.json({
        message: "Produto do marketplace atualizado com sucesso.",
        product: updated
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao atualizar produto." });
    }
  }

  public async submitForReview(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { id } = req.params;
      const product = await productService.submitForReview(
        id,
        actor.id,
        { name: actor.name, email: actor.email }
      );

      return res.json({
        message: "Produto enviado para revisão geral da equipe de análise do JiuSpeak com sucesso.",
        product
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao enviar produto para revisão." });
    }
  }

  public async archiveProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { id } = req.params;
      await productService.archiveProduct(
        id,
        actor.id,
        { name: actor.name, email: actor.email }
      );

      return res.json({
        message: "Produto desativado e arquivado com sucesso no marketplace."
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao arquivar produto." });
    }
  }

  // Admin Only
  public async getPendingProducts(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const { page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) || 1 : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) || 10 : 10;

      const items = await productService.listProducts({
        status: MarketplaceProductStatus.PENDING_REVIEW,
        isArchived: false,
        page: parsedPage,
        limit: parsedLimit
      });

      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar fila de produtos pendentes." });
    }
  }

  public async judgeProduct(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { id } = req.params;
      const parseResult = JudgeProductSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const product = await productService.judgeProduct(
        id,
        parseResult.data.action,
        { id: admin.id, name: admin.name, email: admin.email },
        parseResult.data.notes
      );

      return res.json({
        message: `Análise efetuada com sucesso: status alterado para ${product.status}.`,
        product
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao julgar análise do produto." });
    }
  }
}

export const productController = new ProductController();
