import { z } from "zod";

export const CreateReviewSchema = z.object({
  rating: z.number().int().min(1, "A nota mínima é de 1 estrela.").max(5, "A nota máxima é de 5 estrelas."),
  comment: z.string().max(1000).optional().nullable()
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
