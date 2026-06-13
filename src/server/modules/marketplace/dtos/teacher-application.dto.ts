// Teacher Application DTO & Validator using Zod
import { z } from "zod";

export interface CreateTeacherApplicationDto {
  bio: string;
  academy: string;
  experience: string;
  documents?: {
    documentType: string;
    fileUrl: string;
    fileName?: string;
    fileSize?: number;
  }[];
}

export interface ReviewTeacherApplicationDto {
  status: "APPROVED" | "REJECTED";
  adminNotes?: string;
}

export const CreateTeacherApplicationSchema = z.object({
  bio: z.string().min(10, { message: "Bio deve ter pelo menos 10 caracteres" }).max(1000),
  academy: z.string().min(3, { message: "Nome da academia deve ter pelo menos 3 caracteres" }),
  experience: z.string().min(10, { message: "Detalhes de experiência devem ter pelo menos 10 caracteres" }),
  documents: z.array(
    z.object({
      documentType: z.string().min(2, { message: "Tipo de documento deve ser especificado" }),
      fileUrl: z.string().url({ message: "URL do documento inválida" }),
      fileName: z.string().optional(),
      fileSize: z.number().int().positive().optional()
    })
  ).optional()
});

export const ReviewTeacherApplicationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  adminNotes: z.string().max(500).optional()
});

export const ReviewDocumentSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z.string().max(500).optional()
});

