import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = "maxtechptbr@gmail.com";
  const password = "98922678aA";
  const passwordHash = await bcrypt.hash(password, 10);

  console.log(`🌱 [UPSERT] Iniciando criação ou atualização do administrador...`);

  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: { wallet: true, inventory: true }
  });

  if (existingUser) {
    console.log(`Encontrado usuário: ${email}. Atualizando credenciais e permissões...`);
    await prisma.user.update({
      where: { email },
      data: {
        password: passwordHash,
        role: "ADMIN",
        isAdminApproved: true,
        isBanned: false,
        isSuspended: false,
        isEmailVerified: true
      }
    });
    
    // Assegura estrutura de Wallet
    if (!existingUser.wallet) {
      await prisma.wallet.create({
        data: {
          userId: existingUser.id,
          balanceJT: 2000,
          balanceAvailable: 420.00,
          balancePending: 155.00,
          totalEarned: 575.00,
          totalWithdrawn: 0.00
        }
      });
    }
    
    // Assegura estrutura de Inventory
    if (!existingUser.inventory) {
      await prisma.inventory.create({
        data: { userId: existingUser.id }
      });
    }

    console.log("✓ Credenciais do administrador atualizadas com sucesso no banco de dados.");
  } else {
    console.log(`Administrador não existente. Criando registro completo para: ${email}...`);
    await prisma.user.create({
      data: {
        id: "user_admin_test_1",
        email,
        name: "Flavio Martins (ADMIN)",
        password: passwordHash,
        role: "ADMIN",
        isAdminApproved: true,
        isBanned: false,
        isSuspended: false,
        isEmailVerified: true,
        wallet: {
          create: {
            balanceJT: 2000,
            balanceAvailable: 420.00,
            balancePending: 155.00,
            totalEarned: 575.00,
            totalWithdrawn: 0.00
          }
        },
        inventory: {
          create: {}
        }
      }
    });
    console.log("✓ Administrador criado e configurado com sucesso no banco de dados.");
  }
}

main()
  .catch(e => {
    console.error("✗ Falha ao atualizar administrador:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
