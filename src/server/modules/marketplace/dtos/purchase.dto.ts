import { z } from "zod";

export const PurchaseProductSchema = z.object({
  ipAddress: z.string().optional().or(z.string().length(0)).nullable(),
  fingerprint: z.string().min(5).optional().or(z.string().length(0)).nullable()
});

export type PurchaseProductDto = z.infer<typeof PurchaseProductSchema>;
