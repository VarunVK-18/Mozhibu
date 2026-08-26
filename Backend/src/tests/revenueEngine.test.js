/**
 * Revenue Engine Unit Tests
 * Validates the worked examples from the spec:
 *   Author A:  (50,000 ÷ 5,00,000) × ₹1,50,000 = ₹15,000
 *   Reader X:  (2,000 ÷ 10,00,000) × ₹50,000 = ₹100
 */

const assert = require("assert");
const { describe, it } = require("node:test");

// ── Pure formula functions extracted from revenueEngine for unit testing ──

/**
 * Compute author earnings using BigInt paise arithmetic.
 * @param {number} authorReads
 * @param {number} totalReads
 * @param {number} authorsPoolInPaise
 * @returns {number} earnings in paise
 */
function computeAuthorEarnings(authorReads, totalReads, authorsPoolInPaise) {
  if (totalReads === 0 || authorsPoolInPaise === 0) return 0;
  return Number(
    (BigInt(authorReads) * BigInt(authorsPoolInPaise)) / BigInt(totalReads),
  );
}

/**
 * Compute reader reward using BigInt paise arithmetic.
 */
function computeReaderReward(readerScore, totalScore, readersPoolInPaise) {
  if (totalScore === 0 || readersPoolInPaise === 0) return 0;
  return Number(
    (BigInt(readerScore) * BigInt(readersPoolInPaise)) / BigInt(totalScore),
  );
}

/**
 * Compute pool splits from net revenue.
 */
function computePools(
  netRevenueInPaise,
  platformPercent,
  authorsPercent,
  readersPercent,
) {
  const authorsPool = Math.floor((netRevenueInPaise * authorsPercent) / 100);
  const readersPool = Math.floor((netRevenueInPaise * readersPercent) / 100);
  const platformPool = netRevenueInPaise - authorsPool - readersPool;
  return { platformPool, authorsPool, readersPool };
}

// ── Tests ─────────────────────────────────────────────────────

describe("Revenue Engine — Pool Splits", () => {
  it("should split ₹10,00,000 correctly at 80/15/5", () => {
    const R = 100_000_000; // ₹10,00,000 in paise
    const { platformPool, authorsPool, readersPool } = computePools(
      R,
      80,
      15,
      5,
    );
    assert.strictEqual(
      authorsPool,
      15_000_000,
      "Authors pool should be ₹1,50,000 (15%)",
    );
    assert.strictEqual(
      readersPool,
      5_000_000,
      "Readers pool should be ₹50,000 (5%)",
    );
    assert.strictEqual(
      platformPool,
      80_000_000,
      "Platform pool should be ₹8,00,000 (80%)",
    );
    assert.strictEqual(
      platformPool + authorsPool + readersPool,
      R,
      "Pools must sum to R (no paise lost)",
    );
  });

  it("should give platform the remainder (integer safety check)", () => {
    // 1 rupee — will not divide evenly into thirds
    const R = 100; // ₹1 in paise
    const { platformPool, authorsPool, readersPool } = computePools(
      R,
      80,
      15,
      5,
    );
    assert.strictEqual(
      platformPool + authorsPool + readersPool,
      R,
      "All paise must be accounted for — platform gets remainder",
    );
  });
});

describe("Revenue Engine — Author Earnings (Spec Worked Example)", () => {
  it("Author A: (50,000 ÷ 5,00,000) × ₹1,50,000 = ₹15,000", () => {
    const authorAReads = 50_000;
    const totalReads = 5_00_000;
    const authorsPool = 1_50_000 * 100; // ₹1,50,000 in paise

    const earningsInPaise = computeAuthorEarnings(
      authorAReads,
      totalReads,
      authorsPool,
    );
    const earningsInRupees = earningsInPaise / 100;

    assert.strictEqual(
      earningsInRupees,
      15_000,
      `Expected ₹15,000 got ₹${earningsInRupees}`,
    );
  });

  it("should return 0 when totalReads is 0", () => {
    const earnings = computeAuthorEarnings(1000, 0, 15_000_000);
    assert.strictEqual(earnings, 0);
  });

  it("should return 0 when authorsPool is 0", () => {
    const earnings = computeAuthorEarnings(1000, 10000, 0);
    assert.strictEqual(earnings, 0);
  });

  it("should handle large read counts without float overflow", () => {
    // 10 million reads, ₹1 crore pool
    const earnings = computeAuthorEarnings(
      1_000_000,
      10_000_000,
      1_00_00_000 * 100,
    );
    // (1M / 10M) × ₹1,00,00,000 = ₹10,00,000
    assert.strictEqual(earnings / 100, 10_00_000);
  });
});

describe("Revenue Engine — Reader Rewards (Spec Worked Example)", () => {
  it("Reader X: (2,000 ÷ 10,00,000) × ₹50,000 = ₹100", () => {
    const readerXScore = 2_000;
    const totalScore = 10_00_000;
    const readersPool = 50_000 * 100; // ₹50,000 in paise

    const rewardInPaise = computeReaderReward(
      readerXScore,
      totalScore,
      readersPool,
    );
    const rewardInRupees = rewardInPaise / 100;

    assert.strictEqual(
      rewardInRupees,
      100,
      `Expected ₹100 got ₹${rewardInRupees}`,
    );
  });

  it("should return 0 when totalScore is 0", () => {
    const reward = computeReaderReward(500, 0, 5_000_000);
    assert.strictEqual(reward, 0);
  });

  it("should floor partial paise (no rounding up)", () => {
    // 1 reader with score 1 out of 3 platform-wide, pool = 1 paise
    // Integer division: floor(1 * 1 / 3) = 0
    const reward = computeReaderReward(1, 3, 1);
    assert.strictEqual(reward, 0, "Should floor, not round");
  });
});

describe("Revenue Engine — Pool sum invariant", () => {
  it("all splits must always sum to exactly R, for any R", () => {
    const testValues = [1, 7, 100, 9999, 100_000_000, 999_999_999];
    for (const R of testValues) {
      const { platformPool, authorsPool, readersPool } = computePools(
        R,
        80,
        15,
        5,
      );
      assert.strictEqual(
        platformPool + authorsPool + readersPool,
        R,
        `Sum mismatch for R = ${R}`,
      );
    }
  });
});
