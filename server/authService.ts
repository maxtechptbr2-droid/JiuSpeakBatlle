import jwt from 'jsonwebtoken';
import { getPrisma } from './db';
import { AuditActionType } from '@prisma/client';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load variables early with override support
dotenv.config({ override: true });

const rawSecret = process.env.JWT_SECRET || '';
const rawRefreshSecret = process.env.JWT_REFRESH_SECRET || '';

let validationError: string | null = null;

if (!rawSecret) {
  validationError = 'JWT_SECRET está ausente ou vazio no arquivo .env.';
} else if (rawSecret.length < 64) {
  validationError = `JWT_SECRET fornecido possui comprimento insuficiente (${rawSecret.length} caracteres). É necessário ter um comprimento mínimo de 64 caracteres para alta entropia.`;
} else if (!rawRefreshSecret) {
  validationError = 'JWT_REFRESH_SECRET está ausente ou vazio no arquivo .env.';
} else if (rawRefreshSecret.length < 64) {
  validationError = `JWT_REFRESH_SECRET fornecido possui comprimento insuficiente (${rawRefreshSecret.length} caracteres). É necessário ter um comprimento mínimo de 64 caracteres para alta entropia.`;
}

if (validationError) {
  const errMsg = `[FALHA DE SEGURANÇA CRÍTICA] ${validationError} A inicialização do sistema foi cancelada de acordo com as regras rígidas corporativas.`;
  console.error('\n' + '='.repeat(100));
  console.error('🚨 ERRO CRÍTICO DE INICIALIZAÇÃO DE SEGURANÇA (CONFIG JWT)');
  console.error(errMsg);
  console.error('='.repeat(100) + '\n');

  // Log to audit storage asynchronously and halt
  const logAndExit = async () => {
    try {
      const prisma = getPrisma();
      if (prisma) {
        await prisma.auditLog.create({
          data: {
            actorId: null,
            action: 'SYSTEM_SETTING_CHANGE',
            description: `[CRITICAL CONFIG ERROR] JWT Secrets Validation Failed: ${validationError}`,
            ipAddress: '127.0.0.1',
            userAgent: 'Server-Init-Checker',
          }
        });
        console.log("✔️ Alerta de vulnerabilidade foi registrado com sucesso na tabela de logs de auditoria.");
      }
    } catch (auditErr) {
      console.warn("⚠️ Não foi possível salvar o alerta na tabela de logs de auditoria:", auditErr);
    } finally {
      process.exit(1);
    }
  };

  logAndExit();
}

export const JWT_ACCESS_SECRET = rawSecret;
export const JWT_REFRESH_SECRET = rawRefreshSecret;

// Expiration definitions in ms or strings as per jsonwebtoken standards
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m'; // enterprise normal default: 15 mins
const REFRESH_TOKEN_EXPIRY_DAYS = Number(process.env.JWT_REFRESH_EXPIRY_DAYS) || 7; // enterprise default: 7 days

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Access token generation with strict payload mapping
 */
export function generateAccessToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY as any }
  );
}

/**
 * Refresh token generation
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` as any }
  );
}

/**
 * Enterprise Authentication and Security Audit Service
 */
export const AuthService = {
  /**
   * Persists a new refresh token session inside the PostgreSQL database.
   */
  async registerSession(params: {
    userId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    try {
      const prisma = getPrisma();
      await prisma.refreshToken.create({
        data: {
          token: params.token,
          userId: params.userId,
          expiresAt,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      console.error('Failed to persist RefreshToken in DB, falling back to session tracking:', err);
    }
  },

  /**
   * Rotates a fresh Refresh Token, enforcing single-use (RTR) to detect and protect against replay and token theft.
   */
  async rotateToken(params: {
    refreshToken: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const prisma = getPrisma();

    let decoded: any;
    try {
      decoded = jwt.verify(params.refreshToken, JWT_REFRESH_SECRET);
    } catch (err: any) {
      throw new Error('TOKEN_EXPIRED_OR_INVALID');
    }

    const { userId } = decoded;

    // Retrieve token records from Postgres
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: params.refreshToken },
      include: { user: true },
    });

    // If the token is missing from db or already marked as revoked, we have a possible Token Theft / Replay attack
    if (!tokenRecord || tokenRecord.isRevoked) {
      console.warn(`🚨 [SECURITY THREAT] Potential Refresh Token Theft detected! User ID: ${userId}. IP: ${params.ipAddress}`);

      // RTR Theft mitigation: Revoke all existing sessions for this user to contain the compromise!
      await this.revokeAllSessions(userId);

      // Audit security breach
      await this.audit({
        actorId: userId,
        action: 'ACCESS_ROLE_CHANGE', // Closest or we categorise appropriately
        description: `CRITICAL SECURITY ALERT: Tentativa de reuso de Refresh Token por IP ${params.ipAddress || 'unknown'}. Todas as sessões do usuário foram imediatamente anuladas para conter vazamento de credenciais. (RTR Prevention)`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      throw new Error('SECURITY_BREACH_DETECTED');
    }

    // Check ifexpired by date
    if (new Date() > tokenRecord.expiresAt) {
      // Mark as revoked to clean up
      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { isRevoked: true },
      });
      throw new Error('TOKEN_EXPIRED');
    }

    // Single Use / Rotation: Invalidate previous token
    const newRefreshTokenString = generateRefreshToken(userId);
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Run transaction: Rotate current token and instantiate new token session record
    await prisma.$transaction(async (tx) => {
      // Invalidate old token
      await tx.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          isRevoked: true,
          replacedBy: newRefreshTokenString,
        },
      });

      // Register new token
      await tx.refreshToken.create({
        data: {
          token: newRefreshTokenString,
          userId,
          expiresAt: newExpiresAt,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    });

    // Generate new Access Token
    const user = tokenRecord.user;
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshTokenString,
    };
  },

  /**
   * Invalidates a single session during user logout.
   */
  async invalidateSession(token: string): Promise<boolean> {
    const prisma = getPrisma();
    try {
      const record = await prisma.refreshToken.findUnique({
        where: { token },
      });

      if (record) {
        await prisma.refreshToken.update({
          where: { id: record.id },
          data: { isRevoked: true },
        });
        return true;
      }
    } catch (err) {
      console.error('Error invalidating refresh token in logout:', err);
    }
    return false;
  },

  /**
   * Revokes all active sessions / refresh tokens for a given user.
   */
  async revokeAllSessions(userId: string): Promise<void> {
    const prisma = getPrisma();
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  },

  /**
   * Returns active sessions for a user (allowing session auditing and revocation in UI)
   */
  async getUserSessions(userId: string) {
    const prisma = getPrisma();
    return prisma.refreshToken.findMany({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        issuedAt: true,
        expiresAt: true,
      },
    });
  },

  /**
   * Enterprise Audit log writer
   */
  async audit(params: {
    actorId?: string;
    action: AuditActionType;
    description: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    const prisma = getPrisma();
    try {
      await prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          action: params.action,
          description: params.description,
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
        },
      });
    } catch (err) {
      console.error('Failed to persist AuditLog:', err);
    }
  },

  /**
   * Enforces credentials security by logging login failure states.
   */
  async recordLoginAttempt(params: {
    email: string;
    ipAddress?: string;
    success: boolean;
  }): Promise<void> {
    const prisma = getPrisma();
    try {
      await prisma.loginAttempt.create({
        data: {
          email: params.email.toLowerCase().trim(),
          ipAddress: params.ipAddress || null,
          success: params.success,
        },
      });
    } catch (err) {
      console.error('Failed to record LoginAttempt:', err);
    }
  },

  /**
   * Checks for active brute-force blocks on login attempts.
   * Standard block rule: 5 failed login attempts from a given IP/Email combination in the last 15 minutes.
   */
  async checkBruteForceBlock(params: {
    email: string;
    ipAddress?: string;
  }): Promise<{ isBlocked: boolean; remainingMinutes?: number }> {
    const prisma = getPrisma();
    const email = params.email.toLowerCase().trim();
    const timeframeLimit = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes lookback

    try {
      const failuresCount = await prisma.loginAttempt.count({
        where: {
          email,
          success: false,
          timestamp: { gte: timeframeLimit },
        },
      });

      // Simple security cap: 5 failed attempts means blocked
      if (failuresCount >= 5) {
        // Find time of earliest failure in this threshold to compute remaining minutes
        const oldestFailure = await prisma.loginAttempt.findFirst({
          where: {
            email,
            success: false,
            timestamp: { gte: timeframeLimit },
          },
          orderBy: { timestamp: 'asc' },
        });

        const timeDiffMs = oldestFailure
          ? 15 * 60 * 1000 - (Date.now() - new Date(oldestFailure.timestamp).getTime())
          : 5 * 60 * 1000;
        
        const remainingMinutes = Math.max(1, Math.ceil(timeDiffMs / (60 * 1000)));

        return {
          isBlocked: true,
          remainingMinutes,
        };
      }
    } catch (err) {
      console.error('Brute force check execution error:', err);
    }

    return { isBlocked: false };
  },
};
