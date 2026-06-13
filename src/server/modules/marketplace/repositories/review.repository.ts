import { prisma } from "../../../../../server/db";
import { Prisma } from "@prisma/client";

export class ReviewRepository {
  public async createOrUpdateReview(userId: string, productId: string, rating: number, comment?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Create or Update Review
      const review = await tx.marketplaceReview.upsert({
        where: {
          userId_productId: {
            userId,
            productId
          }
        },
        update: {
          rating,
          comment
        },
        create: {
          userId,
          productId,
          rating,
          comment
        }
      });

      // 2. Aggregate average rating
      const aggregates = await tx.marketplaceReview.aggregate({
        where: { productId },
        _avg: {
          rating: true
        }
      });

      const avgRating = aggregates._avg.rating || 0;

      // 3. Update the Product model's average rating
      await tx.marketplaceProduct.update({
        where: { id: productId },
        data: {
          rating: new Prisma.Decimal(avgRating)
        }
      });

      return review;
    });
  }

  public async getProductReviews(productId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.marketplaceReview.count({ where: { productId } }),
      prisma.marketplaceReview.findMany({
        where: { productId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }
}

export const reviewRepository = new ReviewRepository();
