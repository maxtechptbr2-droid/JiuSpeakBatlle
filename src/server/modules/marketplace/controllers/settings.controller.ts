import { Response } from "express";
import { AuthenticatedMarketplaceRequest } from "../middlewares/marketplace-auth.middleware";
import { settingsService } from "../services/settings.service";
import { UpdateSettingsSchema } from "../dtos/settings.dto";

export class SettingsController {
  public async getSettings(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const settings = await settingsService.getSettings();
      return res.json(settings);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar configurações do marketplace." });
    }
  }

  public async updateSettings(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const actor = req.user;
      if (!actor) {
        return res.status(401).json({ error: "Não autenticado." });
      }

      const parseResult = UpdateSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Erro de validação de dados.",
          details: parseResult.error.flatten().fieldErrors
        });
      }

      const updated = await settingsService.updateSettings(
        { id: actor.id, name: actor.name, email: actor.email },
        parseResult.data
      );

      return res.json({
        message: "Configurações globais atualizadas e registradas com sucesso no Log de Auditoria.",
        settings: updated
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao atualizar configurações." });
    }
  }

  public async getSettingsHistory(req: AuthenticatedMarketplaceRequest, res: Response) {
    try {
      const history = await settingsService.getSettingsHistory();
      return res.json(history);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Erro ao carregar histórico de auditoria." });
    }
  }
}

export const settingsController = new SettingsController();
