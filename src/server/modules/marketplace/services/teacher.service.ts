import { teacherRepository } from "../repositories/teacher.repository";
import { marketplaceEmitter } from "../events/event-emitter";
import { TeacherApplicationStatus } from "@prisma/client";

export class TeacherService {
  public async getProfileByUserId(userId: string) {
    return await teacherRepository.getProfileByUserId(userId);
  }

  public async isTeacher(userId: string): Promise<boolean> {
    return await teacherRepository.isTeacher(userId);
  }

  public async applyToTeacher(
    userId: string,
    actor: { name: string; email: string },
    bio: string,
    academy: string,
    experience: string,
    documents?: {
      documentType: string;
      fileUrl: string;
      fileName?: string;
      fileSize?: number;
    }[]
  ) {
    const application = await teacherRepository.createApplication(userId, bio, academy, experience, documents);

    // Emit event
    marketplaceEmitter.emitMarketplaceEvent(
      "TEACHER_APPLICATION",
      { id: userId, name: actor.name, email: actor.email },
      {
        applicationId: application.id,
        bio: application.bio,
        academy: application.academy,
        experience: application.experience,
        documentsCount: documents?.length || 0
      }
    );

    return application;
  }

  public async verifyDocument(
    documentId: string,
    status: "APPROVED" | "REJECTED",
    admin: { id: string; name: string; email: string },
    rejectionReason?: string
  ) {
    const existing = await teacherRepository.getDocumentById(documentId);
    if (!existing) {
      throw new Error(`Documento de verificação com ID ${documentId} não localizado.`);
    }

    const updated = await teacherRepository.updateDocumentStatus(
      documentId,
      status,
      admin.id,
      rejectionReason
    );

    // Emit event for document validation
    marketplaceEmitter.emitMarketplaceEvent(
      "DOCUMENT_VERIFIED",
      admin,
      {
        documentId,
        applicationId: updated.applicationId,
        documentType: updated.documentType,
        status: updated.status,
        rejectionReason: rejectionReason || null,
        teacherUserId: updated.application.userId,
        teacherName: updated.application.user.name,
        teacherEmail: updated.application.user.email
      }
    );

    return updated;
  }

  public async listApplications(status?: TeacherApplicationStatus, page = 1, limit = 10, userId?: string) {
    return await teacherRepository.getApplications(status, page, limit, userId);
  }

  public async judgeApplication(
    id: string,
    status: "APPROVED" | "REJECTED",
    admin: { id: string; name: string; email: string },
    notes?: string
  ) {
    const existing = await teacherRepository.getApplicationById(id);
    if (!existing) {
      throw new Error(`Inscrição com ID ${id} não localizada.`);
    }

    if (existing.status !== TeacherApplicationStatus.PENDING) {
      throw new Error("Esta inscrição já foi julgada.");
    }

    const applicationStatus = status === "APPROVED" 
      ? TeacherApplicationStatus.APPROVED 
      : TeacherApplicationStatus.REJECTED;

    const updated = await teacherRepository.updateApplicationStatus(
      id,
      applicationStatus,
      admin.id,
      notes
    );

    // Emit matching approved or rejected event
    const eventName = status === "APPROVED" ? "TEACHER_APPROVED" : "TEACHER_REJECTED";
    marketplaceEmitter.emitMarketplaceEvent(
      eventName,
      admin,
      {
        applicationId: id,
        teacherUserId: existing.userId,
        teacherName: existing.user.name,
        teacherEmail: existing.user.email,
        adminNotes: notes
      }
    );

    return updated;
  }
}

export const teacherService = new TeacherService();
