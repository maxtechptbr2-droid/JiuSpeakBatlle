import bcrypt from 'bcrypt';
import { getPrisma } from './db';

// Simulated database interface & In-memory fallback database for the applet
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // matches 'password' field in Prisma
  role: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
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

// Global in-memory cache synchronized to mock database
export const inMemoryUsers: Map<string, AuthUser> = new Map();
export const simulatedSentEmails: Array<{
  id: string;
  to: string;
  subject: string;
  body: string;
  token: string;
  timestamp: Date;
}> = [];

// Seed an initial Admin and User for test evaluation out-of-the-box
const seedInitialUsers = async () => {
  const adminPassHash = await bcrypt.hash('admin123', 10);
  const userPassHash = await bcrypt.hash('user123', 10);

  inMemoryUsers.set('user_admin_test_1', {
    id: 'user_admin_test_1',
    email: 'admin@jiuspeak.com',
    name: 'Mestre Carlos (ADMIN)',
    passwordHash: adminPassHash,
    role: 'ADMIN',
    belt: 'BLACK',
    stripes: 4,
    xp: 2500,
    level: 30,
    elo: 2200,
    balanceAvailableBRL: 1500.00,
    balancePendingBRL: 350.00,
    totalEarnedBRL: 1850.00,
    totalWithdrawnBRL: 0.00,
    isEmailVerified: true,
    verificationToken: null,
    resetToken: null,
    resetTokenExpires: null,
    refreshToken: null,
  });

  inMemoryUsers.set('user_athlete_test_1', {
    id: 'user_athlete_test_1',
    email: 'usuario@jiuspeak.com',
    name: 'Fabio Gurgel Fan (USER)',
    passwordHash: userPassHash,
    role: 'ATHLETE',
    belt: 'WHITE',
    stripes: 1,
    xp: 120,
    level: 2,
    elo: 1050,
    balanceAvailableBRL: 420.00,
    balancePendingBRL: 155.00,
    totalEarnedBRL: 575.00,
    totalWithdrawnBRL: 0.00,
    isEmailVerified: false,
    verificationToken: 'initial_verify_token_example_123',
    resetToken: null,
    resetTokenExpires: null,
    refreshToken: null,
  });
};

seedInitialUsers();

// Helper to interact with DB or fall back to local in-memory records
export const authStore = {
  async findByEmail(email: string): Promise<Partial<AuthUser> | null> {
    const prisma = getPrisma();
    const formattedEmail = email.toLowerCase().trim();
    if (prisma) {
      try {
        const u = await prisma.user.findUnique({ 
          where: { email: formattedEmail },
          include: { wallet: true }
        });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            passwordHash: u.password,
            role: u.role as any,
            belt: u.belt as any,
            stripes: u.stripes,
            xp: u.xp,
            level: u.level,
            elo: u.elo,
            avatar: u.avatar,
            coins: u.wallet?.balanceKC || 0,
            balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : (u.wallet?.balanceBRL ? Number(u.wallet.balanceBRL) : 420.00),
            balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0,
            totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0,
            totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0,
            isEmailVerified: u.isEmailVerified,
            verificationToken: u.verificationToken,
            resetToken: u.resetToken,
            resetTokenExpires: u.resetTokenExpires,
            refreshToken: u.refreshToken,
          };
        }
      } catch (err) {
        console.error('Prisma error finding user by email, falling back to cache:', err);
      }
    }

    // fallback state
    for (const u of inMemoryUsers.values()) {
      if (u.email.toLowerCase() === formattedEmail) {
        return u;
      }
    }
    return null;
  },

  async findById(id: string): Promise<Partial<AuthUser> | null> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        const u = await prisma.user.findUnique({ 
          where: { id },
          include: { wallet: true }
        });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name,
            passwordHash: u.password,
            role: u.role as any,
            belt: u.belt as any,
            stripes: u.stripes,
            xp: u.xp,
            level: u.level,
            elo: u.elo,
            avatar: u.avatar,
            coins: u.wallet?.balanceKC || 0,
            balanceAvailableBRL: u.wallet?.balanceAvailable ? Number(u.wallet.balanceAvailable) : (u.wallet?.balanceBRL ? Number(u.wallet.balanceBRL) : 420.00),
            balancePendingBRL: u.wallet?.balancePending ? Number(u.wallet.balancePending) : 0,
            totalEarnedBRL: u.wallet?.totalEarned ? Number(u.wallet.totalEarned) : 0,
            totalWithdrawnBRL: u.wallet?.totalWithdrawn ? Number(u.wallet.totalWithdrawn) : 0,
            isEmailVerified: u.isEmailVerified,
            verificationToken: u.verificationToken,
            resetToken: u.resetToken,
            resetTokenExpires: u.resetTokenExpires,
            refreshToken: u.refreshToken,
          };
        }
      } catch (err) {
        console.error('Prisma error finding user by id, falling back to cache:', err);
      }
    }
    return inMemoryUsers.get(id) || null;
  },

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: 'ATHLETE' | 'INSTRUCTOR' | 'ADMIN';
    verificationToken: string;
  }): Promise<Partial<AuthUser>> {
    const prisma = getPrisma();
    const formattedEmail = data.email.toLowerCase().trim();
    const role = data.role || 'ATHLETE';

    if (prisma) {
      try {
        const u = await prisma.user.create({
          data: {
            email: formattedEmail,
            name: data.name,
            password: data.passwordHash,
            role: role as any,
            verificationToken: data.verificationToken,
            isEmailVerified: false,
          },
        });
        return {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role as any,
          isEmailVerified: u.isEmailVerified,
        };
      } catch (err) {
        console.error('Prisma error creating user, falling back to memory:', err);
      }
    }

    // fallback
    const id = `user_${Date.now()}`;
    const newUser: AuthUser = {
      id,
      email: formattedEmail,
      name: data.name,
      passwordHash: data.passwordHash,
      role,
      belt: 'WHITE',
      stripes: 0,
      xp: 0,
      level: 1,
      elo: 1000,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.name}`,
      coins: 200,
      isEmailVerified: false,
      verificationToken: data.verificationToken,
      resetToken: null,
      resetTokenExpires: null,
      refreshToken: null,
    };
    inMemoryUsers.set(id, newUser);
    return newUser;
  },

  async updateUser(id: string, fields: Partial<AuthUser>): Promise<boolean> {
    const prisma = getPrisma();
    if (prisma) {
      try {
        // Map AuthUser keys to Prisma Schema fields
        const prismaData: any = {};
        if (fields.name !== undefined) prismaData.name = fields.name;
        if (fields.passwordHash !== undefined) prismaData.password = fields.passwordHash;
        if (fields.role !== undefined) prismaData.role = fields.role;
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

        // Safe persist of Virtual Coin payouts and Financial Wallet fields
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
            walletData.balanceBRL = fields.balanceAvailableBRL; // Sync legacy field too
          }
          if (fields.balancePendingBRL !== undefined) walletData.balancePending = fields.balancePendingBRL;
          if (fields.totalEarnedBRL !== undefined) walletData.totalEarned = fields.totalEarnedBRL;
          if (fields.totalWithdrawnBRL !== undefined) walletData.totalWithdrawn = fields.totalWithdrawnBRL;

          try {
            await prisma.wallet.update({
              where: { userId: id },
              data: walletData
            });
          } catch (wErr) {
            console.warn("Wallet record missing in DB, attempting creation.", wErr);
            try {
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
            } catch (wcErr) {
              console.error("Failed to create user wallet", wcErr);
            }
          }
        }

        return true;
      } catch (err) {
        console.error('Prisma error updating user, falling back to cache:', err);
      }
    }

    const cached = inMemoryUsers.get(id);
    if (cached) {
      inMemoryUsers.set(id, {
        ...cached,
        ...fields,
      });
      return true;
    }
    return false;
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
    // Print to server logs for verification too
    console.log(`\n========================================`);
    console.log(`✉ [SIMULATED EMAIL DISPATCH]`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`TOKEN: ${token}`);
    console.log(`BODY: ${body}`);
    console.log(`========================================\n`);
  }
};
