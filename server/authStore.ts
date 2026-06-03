import bcrypt from 'bcrypt';
import { getPrisma } from './db';

// Unified type representation for authentication states
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // matches 'password' field in Prisma
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
  isAdminApproved: boolean;
  belt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK' | 'RED';
  stripes: number;
  xp: number;
  level: number;
  elo: number;
  avatar?: string | null;
  coins?: number;
  balanceAvailableBRL?: number;
  balancePendingBRL?: number;
  totalEarnedBRL?: number;
  totalWithdrawnBRL?: number;
  isEmailVerified: boolean;
  verificationToken: string | null;
  resetToken: string | null;
  resetTokenExpires: Date | null;
  refreshToken: string | null;
}

// Deprecated in-memory store preserved as an empty map for import-compatibility but completely unused
export const inMemoryUsers: Map<string, AuthUser> = new Map();

export const simulatedSentEmails: Array<{
  id: string;
  to: string;
  subject: string;
  body: string;
  token: string;
  timestamp: Date;
}> = [];

// Seed initial test administrative and athlete accounts into the PostgreSQL database.
const seedInitialUsers = async () => {
  const prisma = getPrisma();
  if (!prisma) return;

  const adminPassHash = await bcrypt.hash('98922678aA', 10);
  const userPassHash = await bcrypt.hash('user123', 10);

  try {
    // 1. Seed Admin Accounts
    const adminExists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr@gmail.com' }
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_1',
          email: 'maxtechptbr@gmail.com',
          name: 'Mestre Carlos (ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true,
          belt: 'BLACK',
          stripes: 4,
          xp: 2500,
          level: 30,
          elo: 2200,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 5000,
              balanceAvailable: 1500.00,
              balanceBRL: 1500.00,
              balancePending: 350.00,
              totalEarned: 1850.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr@gmail.com" seeded successfully inside Postgres.');
    } else {
      // Keep credentials perfectly in sync with requested updates
      await prisma.user.update({
        where: { id: adminExists.id },
        data: {
          email: 'maxtechptbr@gmail.com',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true
        }
      });
      console.log('🌱 Admin credentials updated successfully to match user intent.');
    }

    // Seed Admin Account maxtechptbr@gmail.con
    const adminConExists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr@gmail.con' }
    });

    if (!adminConExists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_con',
          email: 'maxtechptbr@gmail.con',
          name: 'Mestre Carlos (SUPER ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true,
          belt: 'BLACK',
          stripes: 4,
          xp: 2500,
          level: 30,
          elo: 2200,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 5000,
              balanceAvailable: 1500.00,
              balanceBRL: 1500.00,
              balancePending: 350.00,
              totalEarned: 1850.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr@gmail.con" seeded successfully inside Postgres.');
    } else {
      await prisma.user.update({
        where: { id: adminConExists.id },
        data: {
          email: 'maxtechptbr@gmail.con',
          password: adminPassHash,
          role: 'ADMIN',
          isAdminApproved: true
        }
      });
      console.log('🌱 Admin "maxtechptbr.con" credentials updated successfully.');
    }

    // Seed Second Admin Account maxtechptbr9@gmail.com (current workspace environment user)
    const admin9Exists = await prisma.user.findFirst({
      where: { email: 'maxtechptbr9@gmail.com' }
    });

    if (!admin9Exists) {
      await prisma.user.create({
        data: {
          id: 'user_admin_test_9',
          email: 'maxtechptbr9@gmail.com',
          name: 'Mestre Carlos 9 (ADMIN)',
          password: adminPassHash,
          role: 'ADMIN',
          belt: 'BLACK',
          stripes: 4,
          xp: 3000,
          level: 35,
          elo: 2300,
          isEmailVerified: true,
          wallet: {
            create: {
              balanceKC: 6000,
              balanceAvailable: 2500.00,
              balanceBRL: 2500.00,
              balancePending: 500.00,
              totalEarned: 3000.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Admin user "maxtechptbr9@gmail.com" seeded successfully inside Postgres.');
    } else {
      await prisma.user.update({
        where: { id: admin9Exists.id },
        data: {
          role: 'ADMIN',
          password: adminPassHash
        }
      });
      console.log('🌱 Admin "maxtechptbr9" role updated safely to ADMIN.');
    }

    // 2. Seed Standard Test Athlete Account
    const userExists = await prisma.user.findFirst({
      where: {
        OR: [
          { id: 'user_athlete_test_1' },
          { email: 'usuario@jiuspeak.com' }
        ]
      }
    });

    if (!userExists) {
      await prisma.user.create({
        data: {
          id: 'user_athlete_test_1',
          email: 'usuario@jiuspeak.com',
          name: 'Fabio Gurgel Fan (USER)',
          password: userPassHash,
          role: 'ATHLETE',
          belt: 'WHITE',
          stripes: 1,
          xp: 120,
          level: 2,
          elo: 1050,
          isEmailVerified: false,
          verificationToken: 'initial_verify_token_example_123',
          wallet: {
            create: {
              balanceKC: 2200,
              balanceAvailable: 420.00,
              balanceBRL: 420.00,
              balancePending: 155.00,
              totalEarned: 575.00,
              totalWithdrawn: 0.00,
            }
          },
          inventory: {
            create: {}
          }
        }
      });
      console.log('🌱 Athlete user "usuario@jiuspeak.com" seeded successfully inside Postgres.');
    } else {
      // Keep password in sync for athlete
      await prisma.user.update({
        where: { id: userExists.id },
        data: {
          password: userPassHash
        }
      });
      console.log('🌱 Athlete test credentials updated successfully.');
    }

  } catch (error) {
    console.error('❌ Critical error seeding initial user accounts into PostgreSQL:', error);
    process.exit(1);
  }
};

// Execute seeding sequence immediately
seedInitialUsers();

// Exclusively relational data store actions
export const authStore = {
  async findByEmail(email: string): Promise<Partial<AuthUser> | null> {
    const prisma = getPrisma();
    const formattedEmail = email.toLowerCase().trim();

    const u = await prisma.user.findUnique({ 
      where: { email: formattedEmail },
      include: { wallet: true }
    });

    if (!u) return null;

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      passwordHash: u.password,
      role: u.role as any,
      isAdminApproved: u.isAdminApproved,
      belt: u.belt as any,
      stripes: u.stripes,
      xp: u.xp,
      level: u.level,
      elo: u.elo,
      avatar: u.avatar,
      coins: u.wallet?.balanceKC || 0,
      balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : 0.00,
      balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0.00,
      totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0.00,
      totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0.00,
      isEmailVerified: u.isEmailVerified,
      verificationToken: u.verificationToken,
      resetToken: u.resetToken,
      resetTokenExpires: u.resetTokenExpires,
      refreshToken: u.refreshToken,
    };
  },

  async findById(id: string): Promise<Partial<AuthUser> | null> {
    const prisma = getPrisma();
    const u = await prisma.user.findUnique({ 
      where: { id },
      include: { wallet: true }
    });

    if (!u) return null;

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      passwordHash: u.password,
      role: u.role as any,
      isAdminApproved: u.isAdminApproved,
      belt: u.belt as any,
      stripes: u.stripes,
      xp: u.xp,
      level: u.level,
      elo: u.elo,
      avatar: u.avatar,
      coins: u.wallet?.balanceKC || 0,
      balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : 0.00,
      balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0.00,
      totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0.00,
      totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0.00,
      isEmailVerified: u.isEmailVerified,
      verificationToken: u.verificationToken,
      resetToken: u.resetToken,
      resetTokenExpires: u.resetTokenExpires,
      refreshToken: u.refreshToken,
    };
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
    isAdminApproved?: boolean;
    verificationToken: string;
  }): Promise<Partial<AuthUser>> {
    const prisma = getPrisma();
    const formattedEmail = data.email.toLowerCase().trim();
    const role = data.role || 'ATHLETE';
    const approved = data.isAdminApproved !== undefined ? data.isAdminApproved : (role !== 'ADMIN');

    const u = await prisma.user.create({
      data: {
        email: formattedEmail,
        name: data.name,
        password: data.passwordHash,
        role: role as any,
        isAdminApproved: approved,
        verificationToken: data.verificationToken,
        isEmailVerified: false,
        wallet: {
          create: {
            balanceKC: 200,
            balanceAvailable: 0.00,
            balanceBRL: 0.00,
            balancePending: 0.00,
            totalEarned: 0.00,
            totalWithdrawn: 0.00,
          }
        },
        inventory: {
          create: {}
        }
      },
    });

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as any,
      isAdminApproved: u.isAdminApproved,
      isEmailVerified: u.isEmailVerified,
    };
  },

  async updateUser(id: string, fields: Partial<AuthUser>): Promise<boolean> {
    const prisma = getPrisma();
    const prismaData: any = {};

    if (fields.name !== undefined) prismaData.name = fields.name;
    if (fields.passwordHash !== undefined) prismaData.password = fields.passwordHash;
    if (fields.role !== undefined) prismaData.role = fields.role;
    if (fields.isAdminApproved !== undefined) prismaData.isAdminApproved = fields.isAdminApproved;
    if (fields.belt !== undefined) prismaData.belt = fields.belt;
    if (fields.stripes !== undefined) prismaData.stripes = fields.stripes;
    if (fields.xp !== undefined) prismaData.xp = fields.xp;
    if (fields.level !== undefined) prismaData.level = fields.level;
    if (fields.elo !== undefined) prismaData.elo = fields.elo;
    if (fields.avatar !== undefined) prismaData.avatar = fields.avatar;
    if (fields.isEmailVerified !== undefined) prismaData.isEmailVerified = fields.isEmailVerified;
    if (fields.verificationToken !== undefined) prismaData.verificationToken = fields.verificationToken;
    if (fields.resetToken !== undefined) prismaData.resetToken = fields.resetToken;
    if (fields.resetTokenExpires !== undefined) prismaData.resetTokenExpires = fields.resetTokenExpires;
    if (fields.refreshToken !== undefined) prismaData.refreshToken = fields.refreshToken;

    await prisma.user.update({
      where: { id },
      data: prismaData,
    });

    // Handle updates of Wallet and Kimono Coins balance
    if (
      fields.coins !== undefined ||
      fields.balanceAvailableBRL !== undefined ||
      fields.balancePendingBRL !== undefined ||
      fields.totalEarnedBRL !== undefined ||
      fields.totalWithdrawnBRL !== undefined
    ) {
      const walletData: any = {};
      if (fields.coins !== undefined) walletData.balanceKC = fields.coins;
      if (fields.balanceAvailableBRL !== undefined) {
        walletData.balanceAvailable = fields.balanceAvailableBRL;
        walletData.balanceBRL = fields.balanceAvailableBRL;
      }
      if (fields.balancePendingBRL !== undefined) walletData.balancePending = fields.balancePendingBRL;
      if (fields.totalEarnedBRL !== undefined) walletData.totalEarned = fields.totalEarnedBRL;
      if (fields.totalWithdrawnBRL !== undefined) walletData.totalWithdrawn = fields.totalWithdrawnBRL;

      try {
        await prisma.wallet.update({
          where: { userId: id },
          data: walletData
        });
      } catch {
        // Fallback recreate of wallet if it is missing
        await prisma.wallet.create({
          data: {
            userId: id,
            balanceKC: fields.coins || 0,
            balanceAvailable: fields.balanceAvailableBRL || 0,
            balanceBRL: fields.balanceAvailableBRL || 0,
            balancePending: fields.balancePendingBRL || 0,
            totalEarned: fields.totalEarnedBRL || 0,
            totalWithdrawn: fields.totalWithdrawnBRL || 0
          }
        });
      }
    }

    return true;
  },

  logSentEmail(to: string, subject: string, body: string, token: string) {
    const logItem = {
      id: `email_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      to,
      subject,
      body,
      token,
      timestamp: new Date(),
    };
    simulatedSentEmails.unshift(logItem);
    console.log(`\n========================================`);
    console.log(`✉ [SIMULATED EMAIL DISPATCH]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOKEN: ${token}`);
    console.log(`BODY: ${body}`);
    console.log(`========================================\n`);
  }
};
