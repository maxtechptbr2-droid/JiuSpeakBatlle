import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log formatter for professional console & file readout
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `[${timestamp}] [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0 && level.indexOf("error") === -1) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Helper function to build daily rotating file transport
function createRotatingTransport(filename: string, level: string = "info") {
  return new DailyRotateFile({
    filename: path.join(logsDir, `${filename}-%DATE%.log`),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",     // Max file size before rotation
    maxFiles: "14d",     // Keep logs for 14 days
    level: level,
    // Provide a static symlink mapping for raw log streaming tools if needed
    symlinkName: `${filename}.log`,
    createSymlink: true
  });
}

// 1. General Application Logger
export const appLogger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    createRotatingTransport("app", "info"),
    new winston.transports.Console({ format: consoleFormat })
  ],
});

// 2. Dedicated Error Logger
export const errorLogger = winston.createLogger({
  level: "error",
  format: customFormat,
  transports: [
    createRotatingTransport("error", "error"),
    new winston.transports.Console({ format: consoleFormat })
  ],
});

// 3. User Authentication Logger
export const authLogger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    createRotatingTransport("auth", "info"),
    new winston.transports.Console({ format: consoleFormat })
  ],
});

// 4. Payments Financial Transactions Logger
export const paymentLogger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [
    createRotatingTransport("payments", "info"),
    new winston.transports.Console({ format: consoleFormat })
  ],
});

// Professional Convenience Logging Wrappers
export function logApp(message: string, meta: any = {}) {
  appLogger.info(message, meta);
}

export function logError(message: string, error: any = {}) {
  const errorMeta = error instanceof Error 
    ? { message: error.message, stack: error.stack } 
    : error;
  errorLogger.error(message, { error: errorMeta });
}

export function logAuth(
  action: "REGISTER" | "LOGIN" | "LOGOUT" | "SESSION_RESTORE",
  email: string,
  success: boolean,
  meta: any = {}
) {
  authLogger.info(`[Auth] ${action} ${success ? "SUCCESS" : "FAILURE"} - User: ${email}`, {
    action,
    email,
    success,
    ...meta,
    timestamp: new Date().toISOString()
  });
}

export function logPayment(
  action: "PIX_INIT" | "PIX_CONFIRM" | "SUB_CREATE" | "SUB_CANCEL" | "WITHDRAWAL_INIT" | "WITHDRAWAL_APPROVE",
  amount: number,
  userId: string,
  meta: any = {}
) {
  paymentLogger.info(`[Payment] ${action} for User ID ${userId} - Value: $K${amount}`, {
    action,
    userId,
    amount,
    ...meta,
    timestamp: new Date().toISOString()
  });
}

export function logPvP(
  action: "QUEUE_JOIN" | "QUEUE_LEAVE" | "MATCH_START" | "MATCH_END" | "MATCH_ABORT",
  userId: string,
  meta: any = {}
) {
  appLogger.info(`[PvP Arena] ${action} - User/Room: ${userId}`, {
    subsystem: "PvP",
    action,
    userId,
    ...meta,
    timestamp: new Date().toISOString()
  });
}
