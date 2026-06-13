import { Response } from "express";
import { AuthenticatedMarketplaceRequest } from "../middlewares/marketplace-auth.middleware";
import { auditService } from "../services/audit.service";

export class DashboardController {
  public async getAdminMetrics(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const metrics = await auditService.getAdminDashboardMetrics();
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao obter métricas de administração." });
    }
  }

  public async getTeacherMetrics(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: "Professor não autenticado." });
      }

      const metrics = await auditService.getTeacherDashboardMetrics(user.id);
      return res.json(metrics);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao obter métricas do professor do marketplace." });
    }
  }

  public async getAuditHistory(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const logs = await auditService.getRawAuditJsonLogs();
      return res.json({
        totalLogs: logs.length,
        logs: logs.map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return { raw: line };
          }
        })
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar log de auditoria física." });
    }
  }
}

export const dashboardController = new DashboardController();
