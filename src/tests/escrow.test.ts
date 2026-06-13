import { describe, it, expect, vi } from "vitest";

enum PurchaseStatus {
  PENDING = "PENDING",
  RELEASED = "RELEASED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED"
}

interface EscrowPurchase {
  id: string;
  productId: string;
  buyerId: string;
  priceSpentJT: number;
  totalEquivalentBRL: number;
  teacherNetBRL: number;
  status: PurchaseStatus;
  escrowDays: number;
  releaseDate: Date;
}

class EscrowEngine {
  private purchases: EscrowPurchase[] = [];

  constructor(purchases: EscrowPurchase[]) {
    this.purchases = purchases;
  }

  // Exact reproduction of release calculation
  public createEscrowTransaction(priceSpentJT: number, rate: number, escrowDays: number): EscrowPurchase {
    const totalEquivalentBRL = Number((priceSpentJT * rate).toFixed(2));
    const teacherNetBRL = Number((totalEquivalentBRL * 0.85).toFixed(2)); // mock 15% platform fee
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + escrowDays);

    const tx: EscrowPurchase = {
      id: `tx-${Math.random().toString(36).substr(2, 9)}`,
      productId: "prod-abc",
      buyerId: "student-123",
      priceSpentJT,
      totalEquivalentBRL,
      teacherNetBRL,
      status: PurchaseStatus.PENDING,
      escrowDays,
      releaseDate
    };

    this.purchases.push(tx);
    return tx;
  }

  // Filtration logic for selecting eligible escrows
  public getEligibleEscrowsToRelease(referenceDate: Date = new Date()): EscrowPurchase[] {
    return this.purchases.filter(
      p => p.status === PurchaseStatus.PENDING && p.releaseDate <= referenceDate
    );
  }

  // Perform release action
  public releaseEscrowTx(id: string, logCallback?: (msg: string) => void) {
    const tx = this.purchases.find(p => p.id === id);
    if (!tx) {
      throw new Error(`Transação ${id} não localizada.`);
    }
    if (tx.status !== PurchaseStatus.PENDING) {
      throw new Error(`Transação ${id} não está qualificada como pendente.`);
    }
    tx.status = PurchaseStatus.RELEASED;
    if (logCallback) {
      logCallback(`[SUCCESS] Liquidado R$ ${tx.teacherNetBRL} para o professor. Compra ID: ${id}`);
    }
  }
}

describe("Marketplace Escrow Tests - Time-locks & Settlement Reconciliations", () => {
  it("should calculate release dates accurately based on configurable escrow rules", () => {
    const engine = new EscrowEngine([]);
    // Mock system time to be constant
    const systemDate = new Date("2026-06-13T12:00:00.000Z");
    vi.useFakeTimers({ now: systemDate });

    const newTx = engine.createEscrowTransaction(100, 0.10, 7); // 7 days lock
    
    // Release date should be systemDate + 7 days
    const expectedReleaseDate = new Date("2026-06-20T12:00:00.000Z");
    expect(newTx.releaseDate.getTime()).toBe(expectedReleaseDate.getTime());
    expect(newTx.escrowDays).toBe(7);

    vi.useRealTimers();
  });

  it("should block early fund extractions and successfully select/settle unlocked funds by cron timeline", () => {
    const engine = new EscrowEngine([]);
    
    const baseTime = new Date("2026-06-13T10:00:00.000Z");
    vi.useFakeTimers({ now: baseTime });

    // Purchase 1: 5 days escrow (unlocks on 2026-06-18)
    const tx1 = engine.createEscrowTransaction(200, 0.10, 5);
    // Purchase 2: 12 days escrow (unlocks on 2026-06-25)
    const tx2 = engine.createEscrowTransaction(300, 0.10, 12);

    // Timeline checkpoint 1: Checking on June 15 (2 days in) -> None should be eligible
    const check1 = new Date("2026-06-15T12:00:00.000Z");
    let eligible = engine.getEligibleEscrowsToRelease(check1);
    expect(eligible).toHaveLength(0);

    // Timeline checkpoint 2: Checking on June 19 (6 days in) -> Only tx1 is eligible
    const check2 = new Date("2026-06-19T12:00:00.000Z");
    eligible = engine.getEligibleEscrowsToRelease(check2);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe(tx1.id);

    // Perform reconciliation run on tx1
    const logs: string[] = [];
    engine.releaseEscrowTx(tx1.id, (msg) => logs.push(msg));
    expect(tx1.status).toBe(PurchaseStatus.RELEASED);
    expect(logs[0]).toContain(`Liquidado R$ 17`); // 200 * 0.10 * 0.85 = 17 BRL net

    // Verify tx1 is no longer selected as eligible
    eligible = engine.getEligibleEscrowsToRelease(check2);
    expect(eligible).toHaveLength(0);

    // Timeline checkpoint 3: Checking on June 26 (13 days in) -> tx2 is now eligible
    const check3 = new Date("2026-06-26T12:00:00.000Z");
    eligible = engine.getEligibleEscrowsToRelease(check3);
    expect(eligible).toHaveLength(1);
    expect(eligible[0].id).toBe(tx2.id);

    // Settle tx2
    engine.releaseEscrowTx(tx2.id);
    expect(tx2.status).toBe(PurchaseStatus.RELEASED);

    vi.useRealTimers();
  });
});
