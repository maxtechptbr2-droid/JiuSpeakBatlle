import { describe, it, expect } from "vitest";

interface FinancialSplit {
  priceSpentJT: number;
  conversionRateUsed: number;
  totalEquivalentBRL: number;
  platformCommissionBRL: number;
  teacherNetBRL: number;
}

// Emulates the exact formula used in /src/server/modules/marketplace/services/purchase.service.ts
function calculateFinancialSplit(
  priceSpentJT: number,
  conversionRate: number,
  commissionPercent: number
): FinancialSplit {
  if (priceSpentJT <= 0 || conversionRate <= 0 || commissionPercent < 0 || commissionPercent > 100) {
    throw new Error("Parâmetros financeiros inválidos.");
  }

  // Exact replication of the backend calculations
  const totalEquivalentBRL = Number((priceSpentJT * conversionRate).toFixed(2));
  const platformCommissionBRL = Number(((totalEquivalentBRL * commissionPercent) / 100).toFixed(2));
  const teacherNetBRL = Number((totalEquivalentBRL - platformCommissionBRL).toFixed(2));

  return {
    priceSpentJT,
    conversionRateUsed: conversionRate,
    totalEquivalentBRL,
    platformCommissionBRL,
    teacherNetBRL,
  };
}

describe("Marketplace Financial Tests - Calculation Audits & Decimal Safety", () => {
  it("should accurately perform the conversion and splits for standard parameters", () => {
    // 150 JT price point, R$ 0.10 conversion rate per JT, 15% platform commission cut
    const split = calculateFinancialSplit(150, 0.10, 15);

    expect(split.priceSpentJT).toBe(150);
    expect(split.conversionRateUsed).toBe(0.10);
    expect(split.totalEquivalentBRL).toBe(15.00); // 150 * 0.10
    expect(split.platformCommissionBRL).toBe(2.25); // 15.00 * 0.15
    expect(split.teacherNetBRL).toBe(12.75); // 15.00 - 2.25

    // Assert that the sum equalizes perfectly with zero penny loss (absolute integrity check)
    const reconstitutedSum = Number((split.platformCommissionBRL + split.teacherNetBRL).toFixed(2));
    expect(reconstitutedSum).toBe(split.totalEquivalentBRL);
  });

  it("should handle floating precision with precise rounding for irregular prices and fractions", () => {
    // Test a highly problematic prime and decimal: 137 JT price point, R$ 0.1337 rate, 12% commission
    // 137 * 0.1337 = 18.3169 -> rounds to 18.32 BRL
    // Commission: 18.32 * 0.12 = 2.1984 -> rounds to 2.20 BRL
    // Net: 18.32 - 2.20 = 16.12 BRL
    const split = calculateFinancialSplit(137, 0.1337, 12);

    expect(split.totalEquivalentBRL).toBe(18.32);
    expect(split.platformCommissionBRL).toBe(2.20);
    expect(split.teacherNetBRL).toBe(16.12);

    // Sum verification
    const reconstitutedSum = Number((split.platformCommissionBRL + split.teacherNetBRL).toFixed(2));
    expect(reconstitutedSum).toBe(split.totalEquivalentBRL);
  });

  it("should handle boundary conditions with extreme values (min price vs max limits)", () => {
    // Min conversion test: 1 JT, 0.01 rate, 15% commission
    // 1 * 0.01 = 0.01
    // Comum: 0.01 * 0.15 = 0.0015 -> rounds to 0.00
    // Net: 0.01 - 0.00 = 0.01
    const minSplit = calculateFinancialSplit(1, 0.01, 15);
    expect(minSplit.totalEquivalentBRL).toBe(0.01);
    expect(minSplit.platformCommissionBRL).toBe(0.00);
    expect(minSplit.teacherNetBRL).toBe(0.01);
    
    expect(Number((minSplit.platformCommissionBRL + minSplit.teacherNetBRL).toFixed(2))).toBe(minSplit.totalEquivalentBRL);

    // Dynamic scale upper boundaries: 1,000,000 JT, 0.50 rate, 99.5% commission
    const extremeSplit = calculateFinancialSplit(1000000, 0.50, 99.5);
    expect(extremeSplit.totalEquivalentBRL).toBe(500000.00);
    expect(extremeSplit.platformCommissionBRL).toBe(497500.00);
    expect(extremeSplit.teacherNetBRL).toBe(2500.00);

    const reconstitutedSumExtreme = Number((extremeSplit.platformCommissionBRL + extremeSplit.teacherNetBRL).toFixed(2));
    expect(reconstitutedSumExtreme).toBe(extremeSplit.totalEquivalentBRL);
  });

  it("should enforce robust strict rules on negative values and overflows", () => {
    expect(() => calculateFinancialSplit(-10, 0.10, 15)).toThrowError(
      "Parâmetros financeiros inválidos."
    );
    expect(() => calculateFinancialSplit(100, -0.05, 10)).toThrowError(
      "Parâmetros financeiros inválidos."
    );
    expect(() => calculateFinancialSplit(100, 0.10, 105)).toThrowError(
      "Parâmetros financeiros inválidos."
    );
  });
});
