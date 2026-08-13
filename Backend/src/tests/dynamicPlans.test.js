const assert = require('assert');
const { describe, it } = require('node:test');

/**
 * Pure function extracted from hasEntitlement logic for unit testing.
 * Evaluates whether a user is entitled to a benefit based on their subscription document.
 * 
 * @param {object} subscription - The mocked UserSubscription document
 * @param {string} benefitKey - The benefit key to check (e.g. 'offline_downloads')
 * @returns {boolean}
 */
function evaluateEntitlement(subscription, benefitKey) {
  if (!subscription) return false;
  
  // 1. Check immutable snapshot first (protects existing users from plan changes)
  if (subscription.planSnapshot && subscription.planSnapshot.structuredBenefits) {
    return !!subscription.planSnapshot.structuredBenefits[benefitKey];
  }
  
  // 2. Fallback to current plan definition (for users before snapshot feature, or if snapshot missing)
  if (subscription.plan && subscription.plan.structuredBenefits) {
    return !!subscription.plan.structuredBenefits[benefitKey];
  }
  
  return false;
}

describe('Dynamic Plans — Entitlement Engine', () => {
  it('should return true if benefit exists in planSnapshot (Grandfathering)', () => {
    const sub = {
      planSnapshot: {
        structuredBenefits: { offline_downloads: true, priority_support: false }
      },
      plan: {
        // Even if the live plan removed it, snapshot takes precedence
        structuredBenefits: { offline_downloads: false }
      }
    };
    
    assert.strictEqual(evaluateEntitlement(sub, 'offline_downloads'), true);
  });

  it('should return false if benefit is false in planSnapshot, even if live plan added it', () => {
    const sub = {
      planSnapshot: {
        structuredBenefits: { offline_downloads: false }
      },
      plan: {
        // Live plan added it, but user bought it when it was false
        structuredBenefits: { offline_downloads: true }
      }
    };
    
    assert.strictEqual(evaluateEntitlement(sub, 'offline_downloads'), false);
  });

  it('should fallback to live plan if planSnapshot is missing (Legacy subscriptions)', () => {
    const sub = {
      // No snapshot
      plan: {
        structuredBenefits: { multi_language_access: true }
      }
    };
    
    assert.strictEqual(evaluateEntitlement(sub, 'multi_language_access'), true);
    assert.strictEqual(evaluateEntitlement(sub, 'offline_downloads'), false);
  });

  it('should return false if no subscription is provided', () => {
    assert.strictEqual(evaluateEntitlement(null, 'offline_downloads'), false);
    assert.strictEqual(evaluateEntitlement(undefined, 'offline_downloads'), false);
  });
});
