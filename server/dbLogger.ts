import { getPrisma, isDatabaseConnected } from "./db";
import { logApp, logError } from "./logger";

export interface CreateAuditLogArgs {
  actorId?: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  amountBRL?: number;
  amountJT?: number;
}

export interface CreateFinancialLogArgs {
  userId?: string;
  walletId?: string;
  type: string; // "DEPOSIT" | "WITHDRAWAL" | "COMMISSION" | "REFUND" | "TRANSFER" | "PURCHASE"
  amountBRL?: number;
  amountJT?: number;
  balanceBRLBefore?: number;
  balanceBRLAfter?: number;
  balanceJTBefore?: number;
  balanceJTAfter?: number;
  status: string; // "PENDING" | "COMPLETED" | "FAILED"
  description: string;
  transactionId?: string;
}

export async function logDbAudit(args: CreateAuditLogArgs): Promise<boolean> {
  try {
    // 1. Log to Winston file and console first for safety
    logApp(`[DB_AUDIT] ${args.action}: ${args.description}`, { ...args });

    // 2. Try persisting to PostgreSQL if online
    if (isDatabaseConnected()) {
      const db = getPrisma();
      await db.auditLog.create({
        data: {
          actorId: args.actorId || null,
          action: args.action,
          description: args.description,
          ipAddress: args.ipAddress || null,
          userAgent: args.userAgent || null,
          amountBRL: args.amountBRL !== undefined ? args.amountBRL : null,
          amountJT: args.amountJT !== undefined ? args.amountJT : null,
        }
      });
      return true;
    }
  } catch (err: any) {
    logError("Failed to persist database AuditLog entry, falling back to local files.", err);
  }
  return false;
}

export async function logDbFinancial(args: CreateFinancialLogArgs): Promise<boolean> {
  try {
    // 1. Log to Winston / payments logger first for safety
    logApp(`[DB_FINANCIAL] type=${args.type} status=${args.status}: ${args.description}`, { ...args });

    // 2. Try persisting to PostgreSQL if online
    if (isDatabaseConnected()) {
      const db = getPrisma();
      await db.financialLog.create({
        data: {
          userId: args.userId || null,
          walletId: args.walletId || null,
          type: args.type,
          amountBRL: args.amountBRL !== undefined ? args.amountBRL : null,
          amountJT: args.amountJT !== undefined ? args.amountJT : null,
          balanceBRLBefore: args.balanceBRLBefore !== undefined ? args.balanceBRLBefore : null,
          balanceBRLAfter: args.balanceBRLAfter !== undefined ? args.balanceBRLAfter : null,
          balanceJTBefore: args.balanceJTBefore !== undefined ? args.balanceJTBefore : null,
          balanceJTAfter: args.balanceJTAfter !== undefined ? args.balanceJTAfter : null,
          status: args.status,
          description: args.description,
          transactionId: args.transactionId || null,
        }
      });
      return true;
    }
  } catch (err: any) {
    logError("Failed to persist database FinancialLog entry, falling back to local files.", err);
  }
  return false;
}
