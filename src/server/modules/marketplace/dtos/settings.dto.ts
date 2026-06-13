import { z } from "zod";

export const UpdateSettingsSchema = z.object({
  jtToBrlConversionRate: z.number().positive("A taxa de conversão JT para BRL deve ser maior do que zero."),
  defaultPlatformCommission: z.number().min(0).max(100, "A comissão da plataforma deve ser um percentual entre 0 e 100."),
  escrowDays: z.number().int().min(0, "O prazo de escrow deve ser maior ou igual a zero dias."),
  reason: z.string().min(5, "O motivo da alteração de configurações é obrigatório e deve conter pelo menos 5 caracteres.")
});

export type UpdateSettingsDto = z.infer<typeof UpdateSettingsSchema>;
