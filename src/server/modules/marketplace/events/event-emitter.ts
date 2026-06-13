import { EventEmitter } from "events";
import * as fs from "fs";
import * as path from "path";

export class MarketplaceEventEmitter extends EventEmitter {
  private static instance: MarketplaceEventEmitter;
  private logFilePath: string;

  private constructor() {
    super();
    this.logFilePath = path.join(process.cwd(), "logs", "marketplace-audit.log");
    
    // Ensure logs directory exists
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Set up standard handlers
    this.on("audit", (event: { action: string; actor: string; payload: any; security?: any }) => {
      this.writeAuditLog(event);
    });
  }

  public static getInstance(): MarketplaceEventEmitter {
    if (!MarketplaceEventEmitter.instance) {
      MarketplaceEventEmitter.instance = new MarketplaceEventEmitter();
    }
    return MarketplaceEventEmitter.instance;
  }

  public emitMarketplaceEvent(
    action: 
      | "TEACHER_APPLICATION"
      | "TEACHER_APPROVED"
      | "TEACHER_REJECTED"
      | "DOCUMENT_VERIFIED"
      | "PRODUCT_CREATED"
      | "PRODUCT_UPDATED"
      | "PRODUCT_SUBMITTED"
      | "PRODUCT_APPROVED"
      | "PRODUCT_REJECTED"
      | "PURCHASE_COMPLETED"
      | "ESCROW_RELEASED"
      | "REVIEW_CREATED"
      | "SETTINGS_UPDATED"
      | "WITHDRAWAL_REQUESTED",
    actor: { id: string; name: string; email: string },
    payload: any,
    security?: any
  ) {
    const timestamp = new Date().toISOString();
    const eventObj = {
      timestamp,
      action,
      actor,
      payload,
      security: security || { ipAddress: null, fingerprint: null, riskScore: 0 }
    };
    
    // Emit for listeners
    this.emit("audit", eventObj);
    this.emit(action, eventObj);
  }

  private writeAuditLog(event: any) {
    try {
      const logLine = JSON.stringify(event) + "\n";
      fs.appendFileSync(this.logFilePath, logLine, "utf8");
    } catch (err) {
      console.error("Failed to write marketplace audit log:", err);
    }
  }
}

export const marketplaceEmitter = MarketplaceEventEmitter.getInstance();
