import { prisma } from "../../../../../server/db";
import { TeacherApplicationStatus } from "@prisma/client";

export class TeacherRepository {
  public async getProfileByUserId(userId: string) {
    return await prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  public async isTeacher(userId: string): Promise<boolean> {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId }
    });
    return !!(profile && profile.approved);
  }

  public async createApplication(
    userId: string,
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
    return await prisma.marketplaceTeacherApplication.create({
      data: {
        userId,
        bio,
        academy,
        experience,
        status: TeacherApplicationStatus.PENDING,
        documents: documents && documents.length > 0 ? {
          create: documents.map(doc => ({
            documentType: doc.documentType,
            fileUrl: doc.fileUrl,
            fileName: doc.fileName || null,
            fileSize: doc.fileSize || null,
            status: "PENDING"
          }))
        } : undefined
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        documents: true
      }
    });
  }

  public async getApplications(status?: TeacherApplicationStatus, page = 1, limit = 10, userId?: string) {
    const offset = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const [total, items] = await Promise.all([
      prisma.marketplaceTeacherApplication.count({ where }),
      prisma.marketplaceTeacherApplication.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          documents: true
        }
      })
    ]);

    return {
      total,
      totalPages: Math.ceil(total / limit),
      items
    };
  }

  public async getApplicationById(id: string) {
    return await prisma.marketplaceTeacherApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        documents: true
      }
    });
  }

  public async getDocumentById(id: string) {
    return await prisma.marketplaceTeacherDocument.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            user: true
          }
        }
      }
    });
  }

  public async updateDocumentStatus(
    id: string,
    status: string,
    adminId: string,
    rejectionReason?: string
  ) {
    return await prisma.marketplaceTeacherDocument.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
        verifiedAt: new Date(),
        verifiedBy: adminId
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  public async updateApplicationStatus(
    id: string,
    status: TeacherApplicationStatus,
    adminId: string,
    adminNotes?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const appRef = await tx.marketplaceTeacherApplication.update({
        where: { id },
        data: {
          status,
          adminNotes,
          reviewedAt: new Date(),
          reviewedBy: adminId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          documents: true
        }
      });

      // If approved, upsert TeacherProfile and set approved = true
      if (status === TeacherApplicationStatus.APPROVED) {
        await tx.teacherProfile.upsert({
          where: { userId: appRef.userId },
          update: {
            bio: appRef.bio,
            academy: appRef.academy,
            approved: true
          },
          create: {
            userId: appRef.userId,
            bio: appRef.bio,
            academy: appRef.academy,
            approved: true
          }
        });
      } else if (status === TeacherApplicationStatus.REJECTED) {
        // If rejected, deactivate if profile existed
        try {
          await tx.teacherProfile.update({
            where: { userId: appRef.userId },
            data: { approved: false }
          });
        } catch {
          // Profile didn't exist, ignore
        }
      }

      return appRef;
    });
  }
}

export const teacherRepository = new TeacherRepository();
