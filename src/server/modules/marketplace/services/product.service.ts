import { productRepository } from "../repositories/product.repository";
import { teacherRepository } from "../repositories/teacher.repository";
import { marketplaceEmitter } from "../events/event-emitter";
import { MarketplaceProductStatus, MarketplaceProductType } from "@prisma/client";

export class ProductService {
  public async getCategories() {
    return await productRepository.getCategories();
  }

  public async getProductById(id: string) {
    return await productRepository.getProductById(id);
  }

  public async listProducts(params: {
    profileId?: string;
    categoryId?: string;
    type?: MarketplaceProductType;
    status?: MarketplaceProductStatus;
    search?: string;
    isArchived?: boolean;
    page: number;
    limit: number;
  }) {
    return await productRepository.findProducts(params);
  }

  public async createProduct(
    userId: string,
    actor: { name: string; email: string },
    data: {
      categoryId: string;
      title: string;
      description: string;
      priceJT: number;
      type: MarketplaceProductType;
      lessons?: any[];
      files?: any[];
    }
  ) {
    // 1. Get teacher profile
    const profile = await teacherRepository.getProfileByUserId(userId);
    if (!profile || !profile.approved) {
      throw new Error("Apenas professores aprovados podem cadastrar produtos no marketplace.");
    }

    // 2. Clear out IDs and order lessons
    const formattedLessons = (data.lessons || []).map((lesson, idx) => ({
      title: lesson.title,
      description: lesson.description || null,
      videoUrl: lesson.videoUrl || null,
      orderIndex: lesson.orderIndex ?? idx
    }));

    const formattedFiles = (data.files || []).map(file => ({
      name: file.name,
      fileUrl: file.fileUrl,
      fileSize: file.fileSize || null
    }));

    // 3. Create
    const product = await productRepository.createProduct({
      profileId: profile.id,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      priceJT: data.priceJT,
      type: data.type,
      lessons: formattedLessons,
      files: formattedFiles
    });

    // 4. Emit event
    marketplaceEmitter.emitMarketplaceEvent(
      "PRODUCT_CREATED",
      { id: userId, name: actor.name, email: actor.email },
      {
        productId: product.id,
        title: product.title,
        priceJT: product.priceJT,
        type: product.type
      }
    );

    return product;
  }

  public async updateProduct(
    productId: string,
    userId: string,
    actor: { name: string; email: string },
    data: {
      categoryId?: string;
      title?: string;
      description?: string;
      priceJT?: number;
      type?: MarketplaceProductType;
      lessons?: any[];
      files?: any[];
    }
  ) {
    // 1. Fetch existing
    const existing = await productRepository.getProductById(productId);
    if (!existing) {
      throw new Error(`Produto com ID ${productId} não localizado.`);
    }

    // 2. Validate ownership
    if (existing.teacherProfile.userId !== userId) {
      throw new Error("Você não possui permissão para editar este produto.");
    }

    if (existing.isArchived) {
      throw new Error("Não é possível editar um produto arquivado.");
    }

    // 3. Calculate difference on versioned fields
    let triggerVersion = false;
    let oldSnapshot: any = null;
    const currentVersionNum = existing.versions.length;

    if (existing.status === MarketplaceProductStatus.APPROVED) {
      const isTitleDiff = data.title !== undefined && data.title !== existing.title;
      const isDescriptionDiff = data.description !== undefined && data.description !== existing.description;
      const isPriceDiff = data.priceJT !== undefined && data.priceJT !== existing.priceJT;
      const isTypeDiff = data.type !== undefined && data.type !== existing.type;

      let isLessonsDiff = false;
      if (data.lessons !== undefined) {
        const existingCompact = existing.lessons.map(l => ({
          title: l.title,
          description: l.description || "",
          videoUrl: l.videoUrl || "",
          orderIndex: l.orderIndex
        }));
        const incomingCompact = data.lessons.map((l, idx) => ({
          title: l.title,
          description: l.description || "",
          videoUrl: l.videoUrl || "",
          orderIndex: l.orderIndex ?? idx
        }));
        isLessonsDiff = JSON.stringify(existingCompact) !== JSON.stringify(incomingCompact);
      }

      let isFilesDiff = false;
      if (data.files !== undefined) {
        const existingCompact = existing.files.map(f => ({
          name: f.name,
          fileUrl: f.fileUrl
        }));
        const incomingCompact = data.files.map(f => ({
          name: f.name,
          fileUrl: f.fileUrl
        }));
        isFilesDiff = JSON.stringify(existingCompact) !== JSON.stringify(incomingCompact);
      }

      if (isTitleDiff || isDescriptionDiff || isPriceDiff || isTypeDiff || isLessonsDiff || isFilesDiff) {
        triggerVersion = true;
        // Generate JSON Snapshot of current (old approved state)
        oldSnapshot = {
          title: existing.title,
          description: existing.description,
          priceJT: existing.priceJT,
          type: existing.type,
          categoryId: existing.categoryId,
          lessons: existing.lessons.map(l => ({
            title: l.title,
            description: l.description,
            videoUrl: l.videoUrl,
            orderIndex: l.orderIndex
          })),
          files: existing.files.map(f => ({
            name: f.name,
            fileUrl: f.fileUrl,
            fileSize: f.fileSize
          }))
        };
      }
    }

    // 4. Update
    const updated = await productRepository.updateProduct(
      productId,
      data,
      triggerVersion,
      currentVersionNum,
      oldSnapshot
    );

    // 5. Emit event
    marketplaceEmitter.emitMarketplaceEvent(
      "PRODUCT_UPDATED",
      { id: userId, name: actor.name, email: actor.email },
      {
        productId,
        triggeredReanalysis: triggerVersion,
        newStatus: updated.status,
        updatedFields: Object.keys(data)
      }
    );

    return updated;
  }

  public async submitForReview(productId: string, userId: string, actor: { name: string; email: string }) {
    const existing = await productRepository.getProductById(productId);
    if (!existing) {
      throw new Error(`Produto com ID ${productId} não localizado.`);
    }

    if (existing.teacherProfile.userId !== userId) {
      throw new Error("Você não possui permissão para publicar este produto.");
    }

    if (existing.status !== MarketplaceProductStatus.DRAFT && existing.status !== MarketplaceProductStatus.REVISION_REQUIRED) {
      throw new Error("Este produto já foi enviado para análise ou já está ativo.");
    }

    const updated = await productRepository.submitForReview(productId);

    // Emit event
    marketplaceEmitter.emitMarketplaceEvent(
      "PRODUCT_SUBMITTED",
      { id: userId, name: actor.name, email: actor.email },
      {
        productId,
        title: updated.title
      }
    );

    return updated;
  }

  public async archiveProduct(productId: string, userId: string, actor: { name: string; email: string }) {
    const existing = await productRepository.getProductById(productId);
    if (!existing) {
      throw new Error(`Produto com ID ${productId} não localizado.`);
    }

    if (existing.teacherProfile.userId !== userId) {
      throw new Error("Você não possui permissão para arquivar este produto.");
    }

    const updated = await productRepository.deleteProduct(productId);

    // Emit event
    marketplaceEmitter.emitMarketplaceEvent(
      "PRODUCT_UPDATED",
      { id: userId, name: actor.name, email: actor.email },
      {
        productId,
        isArchived: true,
        archivedAt: updated.archivedAt
      }
    );

    return updated;
  }

  public async judgeProduct(
    id: string,
    action: "APPROVE" | "REJECT" | "REQUEST_REVISION",
    admin: { id: string; name: string; email: string },
    notes?: string
  ) {
    const existing = await productRepository.getProductById(id);
    if (!existing) {
      throw new Error(`Produto com ID ${id} não localizado.`);
    }

    if (existing.status !== MarketplaceProductStatus.PENDING_REVIEW) {
      throw new Error("Este produto não está pendente de análise.");
    }

    const updated = await productRepository.judgeProduct(id, action, admin.id, notes);

    // Emit MATCHING events (PRODUCT_APPROVED / PRODUCT_REJECTED / general review)
    if (action === "APPROVE") {
      marketplaceEmitter.emitMarketplaceEvent(
        "PRODUCT_APPROVED",
        admin,
        {
          productId: id,
          title: updated.title,
          teacherProfileId: updated.profileId,
          notes
        }
      );
    } else {
      marketplaceEmitter.emitMarketplaceEvent(
        "PRODUCT_REJECTED",
        admin,
        {
          productId: id,
          title: updated.title,
          teacherProfileId: updated.profileId,
          action,
          notes
        }
      );
    }

    return updated;
  }
}

export const productService = new ProductService();
