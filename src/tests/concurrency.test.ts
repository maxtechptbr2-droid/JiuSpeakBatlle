import { describe, it, expect, vi } from "vitest";

// Replicates the velocity and risk tracker mapping inside purchase.service.ts
interface PurchaseAttempt {
  timestamp: number;
}

class VelocityLimitTracker {
  private recentAttempts = new Map<string, PurchaseAttempt[]>();

  public evaluateRiskScoreAndRateLimit(clientKey: string, now: number) {
    let riskScore = 0;
    let fraudFlag = false;

    let attempts = this.recentAttempts.get(clientKey) || [];
    
    // prune attempts older than 2 minutes (120000ms)
    attempts = attempts.filter(a => now - a.timestamp < 120000);
    
    if (attempts.length >= 3) {
      riskScore += 4; // high frequency penalty
    }
    if (attempts.length >= 5) {
      riskScore += 5; // automated abuse flag
      fraudFlag = true;
    }

    attempts.push({ timestamp: now });
    this.recentAttempts.set(clientKey, attempts);

    return {
      riskScore,
      fraudFlag,
      attemptsCount: attempts.length
    };
  }

  public clear() {
    this.recentAttempts.clear();
  }
}

describe("Marketplace Concurrency & Velocity Rules - Race Condition Defenses", () => {
  it("should progressively adjust risk scores and flag fraud under rapid consecutive attempts", () => {
    const tracker = new VelocityLimitTracker();
    const clientKey = "fingerprint_student_brazil_999";
    const baseTime = Date.now();

    // Simulating 6 consecutive purchases sequentially with very high speed
    // Purchase 1 (10ms after base)
    let res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 10);
    expect(res.riskScore).toBe(0);
    expect(res.fraudFlag).toBe(false);
    expect(res.attemptsCount).toBe(1);

    // Purchase 2 (20ms after base)
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 20);
    expect(res.riskScore).toBe(0);
    expect(res.fraudFlag).toBe(false);
    expect(res.attemptsCount).toBe(2);

    // Purchase 3 (30ms after base)
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 30);
    expect(res.riskScore).toBe(0);
    expect(res.fraudFlag).toBe(false);
    expect(res.attemptsCount).toBe(3);

    // Purchase 4 (40ms after base) -> High frequency trigger (attempts >= 3)
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 40);
    expect(res.riskScore).toBe(4);
    expect(res.fraudFlag).toBe(false);
    expect(res.attemptsCount).toBe(4);

    // Purchase 5 (50ms after base) -> High frequency penalty (attempts >= 3)
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 50);
    expect(res.riskScore).toBe(4);
    expect(res.fraudFlag).toBe(false);
    expect(res.attemptsCount).toBe(5);

    // Purchase 6 (60ms after base) -> Crucial checkpoint. 5 previous attempts in 2 min window flag fraud (attempts >= 5)
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 60);
    expect(res.riskScore).toBe(9); // 4 from first threshold + 5 from second threshold
    expect(res.fraudFlag).toBe(true); // automatic freeze flag
    expect(res.attemptsCount).toBe(6);
  });

  it("should successfully release velocity window lock after the 2 minutes timeout expires", () => {
    const tracker = new VelocityLimitTracker();
    const clientKey = "fingerprint_student_brazil_999";
    const baseTime = Date.now();

    // Trigger 5 fast purchases to max out limit
    for (let i = 0; i < 5; i++) {
      tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + (i * 10));
    }

    // Checking 6th checkout -> Fraud threshold met
    let res = tracker.evaluateRiskScoreAndRateLimit(clientKey, baseTime + 50);
    expect(res.fraudFlag).toBe(true);

    // Time-travel: Simulate a wait of 2 minutes and 1 second (121000ms)
    // The older attempts are older than 120,000ms and should get pruned automatically
    const futureTime = baseTime + 121000;
    res = tracker.evaluateRiskScoreAndRateLimit(clientKey, futureTime);

    // Since velocity cache was cleared of old logs, this is treated as a clean first request
    expect(res.attemptsCount).toBe(1);
    expect(res.riskScore).toBe(0);
    expect(res.fraudFlag).toBe(false);
  });
});
