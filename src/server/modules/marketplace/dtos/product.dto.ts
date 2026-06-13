import { z } from "zod";
import { MarketplaceProductType } from "@prisma/client";

// Define schemas for validating lessons and files nesting
export const ProductLessonSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(1000).optional(),
  videoUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  orderIndex: z.number().int().min(0)
});

export const ProductFileSchema = z.object({
  name: z.string().min(1).max(255),
  fileUrl: z.string().url(),
  fileSize: z.number().int().positive().optional().nullable()
});

export const CreateProductSchema = z.object({
  title: z.string().min(3, "O título do produto deve conter pelo menos 3 caracteres.").max(255),
  description: z.string().min(10, "A descrição deve conter pelo menos 10 caracteres."),
  priceJT: z.number().int().min(0, "O preço em JT não pode ser negativo."),
  type: z.nativeEnum(MarketplaceProductType),
  categoryId: z.string().uuid("ID de categoria inválido."),
  lessons: z.array(ProductLessonSchema).optional().default([]),
  files: z.array(ProductFileSchema).optional().default([])
});

export const UpdateProductSchema = CreateProductSchema.partial();

export const JudgeProductSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "REQUEST_REVISION"]),
  notes: z.string().max(1000).optional()
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
export type JudgeProductDto = z.infer<typeof JudgeProductSchema>;
