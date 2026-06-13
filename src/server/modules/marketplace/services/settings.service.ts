import { settingsRepository } from "../repositories/settings.repository";
import { marketplaceEmitter } from "../events/event-emitter";

export class SettingsService {
  public async getSettings() {
    return await settingsRepository.getSettings();
  }

  public async updateSettings(
    actor: { id: string; name: string; email: string },
    data: {
      jtToBrlConversionRate: number;
      defaultPlatformCommission: number;
      escrowDays: number;
      reason: string;
    }
  ) {
    const oldSettings = await settingsRepository.getSettings();

    const updated = await settingsRepository.updateSettings(
      {
        jtToBrlConversionRate: data.jtToBrlConversionRate,
        defaultPlatformCommission: data.defaultPlatformCommission,
        escrowDays: data.escrowDays
      },
      {
        adminId: actor.id,
        adminName: actor.name,
        adminEmail: actor.email,
        reason: data.reason,
        oldValue: {
          jtToBrlConversionRate: Number(oldSettings.jtToBrlConversionRate),
          defaultPlatformCommission: Number(oldSettings.defaultPlatformCommission),
          escrowDays: oldSettings.escrowDays
        },
        newValue: {
          jtToBrlConversionRate: data.jtToBrlConversionRate,
          defaultPlatformCommission: data.defaultPlatformCommission,
          escrowDays: data.escrowDays
        }
      }
    );

    // Emit Settings Update Event
    marketplaceEmitter.emitMarketplaceEvent(
      "SETTINGS_UPDATED",
      actor,
      {
        oldValue: oldSettings,
        newValue: updated,
        reason: data.reason
      }
    );

    return updated;
  }

  public async getSettingsHistory() {
    return await settingsRepository.getSettingsHistory();
  }
}

export const settingsService = new SettingsService();
