import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== INICIANDO AUDITORIA EXCLUSIVA DO POSTGRESQL VIA PRISMA ===");

  // 1. Count records in tables
  const socialPostCount = await prisma.socialPost.count();
  const commentCount = await prisma.socialComment.count().catch(() => prisma.comment.count()); // Let's check model names in prisma schema if these names differ
  // Let's actually find the model names in schema.prisma
  console.log("=== COUNT DE REGISTROS ===");
  console.log("SocialPost:", socialPostCount);
  
  // Let's query dynamic counts inside try/catch so to be safe against model names
  try {
    const uc = await prisma.user.count();
    console.log("User:", uc);
  } catch (e: any) {
    console.log("Error querying User:", e.message);
  }

  try {
    const sc = await prisma.socialComment?.count() || 0;
    console.log("SocialComment:", sc);
  } catch (e: any) {
    console.log("SocialComment not found, checking comment / other tables");
  }

  try {
    const lk = await prisma.socialLike?.count() || 0;
    console.log("SocialLike:", lk);
  } catch (e: any) {
    console.log("SocialLike not found");
  }

  try {
    const uss = await prisma.userSession.count();
    console.log("UserSession:", uss);
  } catch (e: any) {
    console.log("Error querying UserSession:", e.message);
  }

  // 2. Query top 20 users by ELO
  console.log("=== TOP 20 USUÁRIOS POR ELO ===");
  try {
    const topEloUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        elo: true,
        level: true
      },
      orderBy: {
        elo: 'desc'
      },
      take: 20
    });
    console.log(JSON.stringify(topEloUsers, null, 2));
  } catch (e: any) {
    console.log("Error querying top ELO users:", e.message);
  }

  // 3. Query top 10 recent posts
  console.log("=== 10 POSTS MAIS RECENTES ===");
  try {
    const recentPosts = await prisma.socialPost.findMany({
      select: {
        id: true,
        authorId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(JSON.stringify(recentPosts, null, 2));
  } catch (e: any) {
    console.log("Error querying recent posts:", e.message);
  }

  // 4. Count users with elo > 0
  console.log("=== USUÁRIOS COM ELO > 0 ===");
  try {
    const eloGreaterThanZero = await prisma.user.count({
      where: {
        elo: {
          gt: 0
        }
      }
    });
    console.log("Total:", eloGreaterThanZero);
  } catch (e: any) {
    console.log("Error counting elo > 0:", e.message);
  }

  // 5. Count users with xp > 0
  console.log("=== USUÁRIOS COM XP > 0 ===");
  try {
    const xpGreaterThanZero = await prisma.user.count({
      where: {
        xp: {
          gt: 0
        }
      }
    });
    console.log("Total:", xpGreaterThanZero);
  } catch (e: any) {
    console.log("Error counting xp > 0:", e.message);
  }

  // 6 & 7. Confirm presence of specific names in all tables
  const targetNames = [
    "Rafael Almeida",
    "Ana Beatriz",
    "Matheus Lima",
    "Maria Clara",
    "Lucas Monteiro",
    "John Doe",
    "Takeshi Sato",
    "Rodrigo BJJ"
  ];
  
  console.log("=== PROCURANDO NOMES EM TODAS AS TABELAS ===");
  for (const name of targetNames) {
    const usersWithName = await prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    if (usersWithName.length > 0) {
      console.log(`[User Table] Encontrado "${name}":`, JSON.stringify(usersWithName, null, 2));
    } else {
      console.log(`[User Table] Nenhuma ocorrência para "${name}"`);
    }
  }

  // Also query other potential tables for safety
  try {
    // Check if there are posts with those author names
    const postsWithNames = await prisma.socialPost.findMany({
      where: {
        author: {
          name: {
            in: targetNames
          }
        }
      },
      include: {
        author: {
          select: { name: true }
        }
      }
    });
    console.log(`[SocialPost Table] Ocorrências com autores mock:`, postsWithNames.length);
  } catch (e) {
    // Ignore if relation or table fails
  }

  console.log("=== FIM DA AUDITORIA ===");
}

main()
  .catch(err => {
    console.error("Erro fatal:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
