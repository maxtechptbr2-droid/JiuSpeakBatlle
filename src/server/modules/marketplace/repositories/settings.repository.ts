import { prisma } from "../../../../../server/db";
import { Prisma } from "@prisma/client";

export class SettingsRepository {
  public async getSettings() {
    let settings = await prisma.marketplaceSettings.findUnique({
      where: { id: "default" }
    });

    if (!settings) {
      settings = await prisma.marketplaceSettings.create({
        data: {
          id: "default",
          jtToBrlConversionRate: new Prisma.Decimal(0.0100),
          defaultPlatformCommission: new Prisma.Decimal(10.00),
          escrowDays: 7
        }
      });
    }

    return settings;
  }

  public async updateSettings(
    data: {
      jtToBrlConversionRate: number;
      defaultPlatformCommission: number;
      escrowDays: number;
    },
    history: {
      adminId: string;
      adminName: string;
      adminEmail: string;
      reason: string;
      oldValue: any;
      newValue: any;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const updated = await tx.marketplaceSettings.update({
        where: { id: "default" },
        data: {
          jtToBrlConversionRate: new Prisma.Decimal(data.jtToBrlConversionRate),
          defaultPlatformCommission: new Prisma.Decimal(data.defaultPlatformCommission),
          escrowDays: data.escrowDays
        }
      });

      await tx.marketplaceSettingsHistory.create({
        data: {
          adminId: history.adminId,
          adminName: history.adminName,
          adminEmail: history.adminEmail,
          reason: history.reason,
          oldValue: history.oldValue,
          newValue: history.newValue
        }
      });

      return updated;
    });
  }

  public async getSettingsHistory() {
    return await prisma.marketplaceSettingsHistory.findMany({
      orderBy: { createdAt: "desc" }
    });
  }
}

export const settingsRepository = new SettingsRepository();
