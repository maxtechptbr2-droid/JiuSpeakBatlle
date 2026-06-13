import { Response } from "express";
import { AuthenticatedMarketplaceRequest } from "../middlewares/marketplace-auth.middleware";
import { teacherService } from "../services/teacher.service";
import {
  CreateTeacherApplicationSchema,
  ReviewTeacherApplicationSchema,
  ReviewDocumentSchema
} from "../dtos/teacher-application.dto";

export class TeacherController {
  public async apply(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const parseResult = CreateTeacherApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const existingProfile = await teacherService.getProfileByUserId(user.id);
      if (existingProfile && existingProfile.approved) {
        return res.status(400).json({ error: "Você já possui um perfil de professor aprovado e ativo." });
      }

      const app = await teacherService.applyToTeacher(
        user.id,
        { name: user.name, email: user.email },
        parseResult.data.bio,
        parseResult.data.academy,
        parseResult.data.experience,
        parseResult.data.documents
      );

      return res.status(201).json({
        message: "Inscrição de professor enviada para análise de credenciais com sucesso.",
        application: app
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao processar inscrição de professor." });
    }
  }

  public async getApplications(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { status, page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) || 1 : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) || 10 : 10;
      const statusFilter: any = status ? String(status).toUpperCase() : undefined;

      const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(user.role);
      const userIdFilter = isAdmin ? undefined : user.id;

      const items = await teacherService.listApplications(statusFilter, parsedPage, parsedLimit, userIdFilter);
      return res.json(items);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar lista de inscrições." });
    }
  }

  public async judgeApplication(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { id } = req.params;
      const parseResult = ReviewTeacherApplicationSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const app = await teacherService.judgeApplication(
        id,
        parseResult.data.status,
        { id: admin.id, name: admin.name, email: admin.email },
        parseResult.data.adminNotes
      );

      return res.json({
        message: `Inscrição julgada com sucesso como ${parseResult.data.status}.`,
        application: app
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao julgar inscrição." });
    }
  }

  public async judgeDocument(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const admin = req.user;
      if (!admin) {
        return res.status(401).json({ error: "Autenticação requerida." });
      }

      const { documentId } = req.params;
      const parseResult = ReviewDocumentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const updatedDoc = await teacherService.verifyDocument(
        documentId,
        parseResult.data.status,
        { id: admin.id, name: admin.name, email: admin.email },
        parseResult.data.rejectionReason
      );

      return res.json({
        message: `Status do documento de verificação atualizado para ${parseResult.data.status} com sucesso.`,
        document: updatedDoc
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao julgar documento de verificação." });
    }
  }
}

export const teacherController = new TeacherController();
