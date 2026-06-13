import { prisma } from "../../../../../server/db";
import { MarketplaceProductStatus, MarketplaceProductType, ReviewAction } from "@prisma/client";

export class ProductRepository {
  // Categories
  public async getCategories() {
    return await prisma.marketplaceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });
  }

  public async createCategory(name: string, slug: string, description?: string) {
    return await prisma.marketplaceCategory.create({
      data: { name, slug, description }
    });
  }

  // Find products (store view / teacher view)
  public async findProducts(params: {
    profileId?: string;
    categoryId?: string;
    type?: MarketplaceProductType;
    status?: MarketplaceProductStatus;
    search?: string;
    isArchived?: boolean;
    page: number;
    limit: number;
  }) {
    const { profileId, categoryId, type, status, search, isArchived = false, page, limit } = params;
    const offset = (page - 1) * limit;

    const where: any = {
      isArchived
    };

    if (profileId) where.profileId = profileId;
    if (categoryId) where.categoryId = categoryId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } }
      ];
    }

    const [total, items] = await Promise.all([
      prisma.marketplaceProduct.count({ where }),
      prisma.marketplaceProduct.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          teacherProfile: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          lessons: {
            orderBy: { orderIndex: "asc" }
          },
          files: true
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }

  public async getProductById(id: string) {
    return await prisma.marketplaceProduct.findUnique({
      where: { id },
      include: {
        category: true,
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        lessons: {
          orderBy: { orderIndex: "asc" },
          include: { files: true }
        },
        files: true,
        versions: {
          orderBy: { version: "desc" }
        },
        reviewHistories: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  public async createProduct(data: {
    profileId: string;
    categoryId: string;
    title: string;
    description: string;
    priceJT: number;
    type: MarketplaceProductType;
    lessons?: any[];
    files?: any[];
  }) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.marketplaceProduct.create({
        data: {
          profileId: data.profileId,
          categoryId: data.categoryId,
          title: data.title,
          description: data.description,
          priceJT: data.priceJT,
          type: data.type,
          status: MarketplaceProductStatus.DRAFT
        }
      });

      // Add lessons
      if (data.lessons && data.lessons.length > 0) {
        for (const lesson of data.lessons) {
          await tx.marketplaceLesson.create({
            data: {
              productId: product.id,
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl,
              orderIndex: lesson.orderIndex
            }
          });
        }
      }

      // Add files
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          await tx.marketplaceFile.create({
            data: {
              productId: product.id,
              name: file.name,
              fileUrl: file.fileUrl,
              fileSize: file.fileSize
            }
          });
        }
      }

      // Create history
      await tx.productReviewHistory.create({
        data: {
          productId: product.id,
          action: ReviewAction.SUBMIT,
          actorId: data.profileId,
          notes: "Produto criado no modo rascunho"
        }
      });

      return product;
    });
  }

  public async updateProduct(
    id: string,
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      priceJT?: number;
      type?: MarketplaceProductType;
      lessons?: any[];
      files?: any[];
    },
    triggerVersion: boolean,
    currentVersionNum: number,
    snapshotJson: any
  ) {
    return await prisma.$transaction(async (tx) => {
      // Step A: versioning if triggerVersion is active
      if (triggerVersion) {
        await tx.marketplaceProductVersion.create({
          data: {
            productId: id,
            version: currentVersionNum + 1,
            snapshot: snapshotJson
          }
        });
      }

      // Step B: Update core product fields
      const updatedProduct = await tx.marketplaceProduct.update({
        where: { id },
        data: {
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.title && { title: data.title }),
          ...(data.description && { description: data.description }),
          ...(data.priceJT !== undefined && { priceJT: data.priceJT }),
          ...(data.type && { type: data.type }),
          ...(triggerVersion && { status: MarketplaceProductStatus.PENDING_REVIEW }) // send back to review
        }
      });

      // Step C: If lessons are included, replace them
      if (data.lessons !== undefined) {
        // Delete existing lessons safely
        await tx.marketplaceLesson.deleteMany({ where: { productId: id } });
        for (const lesson of data.lessons) {
          await tx.marketplaceLesson.create({
            data: {
              productId: id,
              title: lesson.title,
              description: lesson.description,
              videoUrl: lesson.videoUrl,
              orderIndex: lesson.orderIndex
            }
          });
        }
      }

      // Step D: If files are included, replace them
      if (data.files !== undefined) {
        await tx.marketplaceFile.deleteMany({ where: { productId: id } });
        for (const file of data.files) {
          await tx.marketplaceFile.create({
            data: {
              productId: id,
              name: file.name,
              fileUrl: file.fileUrl,
              fileSize: file.fileSize
            }
          });
        }
      }

      return updatedProduct;
    });
  }

  public async deleteProduct(id: string) {
    return await prisma.marketplaceProduct.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date()
      }
    });
  }

  public async submitForReview(id: string) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.marketplaceProduct.update({
        where: { id },
        data: { status: MarketplaceProductStatus.PENDING_REVIEW }
      });

      await tx.productReviewHistory.create({
        data: {
          productId: id,
          action: ReviewAction.SUBMIT,
          actorId: product.profileId,
          notes: "Enviado para análise"
        }
      });

      return product;
    });
  }

  public async judgeProduct(id: string, action: "APPROVE" | "REJECT" | "REQUEST_REVISION", actorId: string, notes?: string) {
    let status: MarketplaceProductStatus;
    let dbAction: ReviewAction;

    if (action === "APPROVE") {
      status = MarketplaceProductStatus.APPROVED;
      dbAction = ReviewAction.APPROVE;
    } else if (action === "REJECT") {
      status = MarketplaceProductStatus.REJECTED;
      dbAction = ReviewAction.REJECT;
    } else {
      status = MarketplaceProductStatus.REVISION_REQUIRED;
      dbAction = ReviewAction.REQUEST_REVISION;
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.marketplaceProduct.update({
        where: { id },
        data: { 
          status,
          rejectionReason: action !== "APPROVE" ? notes : null
        }
      });

      await tx.productReviewHistory.create({
        data: {
          productId: id,
          action: dbAction,
          actorId,
          notes: notes || "Julgamento efetuado pelo administrador"
        }
      });

      return product;
    });
  }
}

export const productRepository = new ProductRepository();
