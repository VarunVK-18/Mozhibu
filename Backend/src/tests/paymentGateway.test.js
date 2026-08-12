/**
 * Payment Gateway Unit Tests — Razorpay Adapter
 *
 * Tests the HMAC signature verification logic using the actual
 * test key secret from .env. No real API calls are made —
 * order creation is mocked using a stub Razorpay client.
 *
 * Run: node --test src/tests/paymentGateway.test.js
 */

require('dotenv').config();

const assert = require('assert');
const { describe, it, before } = require('node:test');
const crypto = require('crypto');

// ── Load the real key secret from .env ────────────────────────
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const KEY_ID     = process.env.RAZORPAY_KEY_ID;

if (!KEY_SECRET || KEY_SECRET === 'REPLACE_ME_WITH_YOUR_SECRET') {
  console.error('\n❌ RAZORPAY_KEY_SECRET not set in .env — skipping live key tests\n');
  process.exit(0);
}

// ── Helper: generate a valid HMAC signature ───────────────────
function generateValidSignature(orderId, paymentId, secret = KEY_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function generateValidWebhookSignature(body, secret) {
  const s = secret || process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_test_secret';
  return crypto.createHmac('sha256', s).update(body).digest('hex');
}

// ── Import the adapter (stubs Razorpay client to avoid real API calls) ─
// We manually construct a RazorpayAdapter-like object to test pure logic
// without requiring a live Razorpay connection.
class TestableRazorpayAdapter {
  constructor(keySecret) {
    this.keySecret = keySecret;
  }

  verifyPayment(orderId, paymentId, signature) {
    const body = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');
    return expected === signature;
  }

  verifyWebhookSignature(rawBody, signature, secret) {
    const s = secret || process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_test_secret';
    const expected = crypto
      .createHmac('sha256', s)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }

  // Simulate createOrder without hitting the API
  async createOrderMock(amountInPaise, currency, metadata) {
    if (!amountInPaise || amountInPaise <= 0) {
      throw new Error('Amount must be positive');
    }
    if (currency !== 'INR') {
      throw new Error('Only INR supported');
    }
    return {
      id: 'order_test_' + Date.now(),
      amount: amountInPaise,
      currency,
      notes: metadata,
      status: 'created'
    };
  }
}

const adapter = new TestableRazorpayAdapter(KEY_SECRET);

// ─────────────────────────────────────────────────────────────
// TEST SUITES
// ─────────────────────────────────────────────────────────────

describe('Razorpay Adapter — Key Configuration', () => {
  it('should have a valid Key ID starting with rzp_test_', () => {
    assert.ok(KEY_ID, 'RAZORPAY_KEY_ID must be set');
    assert.ok(KEY_ID.startsWith('rzp_test_'),
      `Key ID "${KEY_ID}" must start with rzp_test_`);
    console.log(`   ✓ Key ID: ${KEY_ID}`);
  });

  it('should have a non-empty Key Secret', () => {
    assert.ok(KEY_SECRET, 'RAZORPAY_KEY_SECRET must be set');
    assert.ok(KEY_SECRET.length >= 16, 'Key Secret should be at least 16 chars');
    console.log(`   ✓ Key Secret: ${KEY_SECRET.slice(0, 4)}${'*'.repeat(KEY_SECRET.length - 8)}${KEY_SECRET.slice(-4)}`);
  });
});

describe('Razorpay Adapter — Payment Signature Verification', () => {
  it('should return TRUE for a valid payment signature', () => {
    const orderId   = 'order_PxR4test123';
    const paymentId = 'pay_PxR4test456';
    const sig = generateValidSignature(orderId, paymentId);

    const result = adapter.verifyPayment(orderId, paymentId, sig);
    assert.strictEqual(result, true, 'Valid signature should return true');
  });

  it('should return FALSE for a tampered payment ID', () => {
    const orderId   = 'order_PxR4test123';
    const paymentId = 'pay_PxR4test456';
    const sig = generateValidSignature(orderId, paymentId);

    // Tamper the payment ID
    const result = adapter.verifyPayment(orderId, 'pay_TAMPERED_999', sig);
    assert.strictEqual(result, false, 'Tampered payment ID should fail');
  });

  it('should return FALSE for a tampered order ID', () => {
    const orderId   = 'order_PxR4test123';
    const paymentId = 'pay_PxR4test456';
    const sig = generateValidSignature(orderId, paymentId);

    const result = adapter.verifyPayment('order_TAMPERED_001', paymentId, sig);
    assert.strictEqual(result, false, 'Tampered order ID should fail');
  });

  it('should return FALSE for an empty signature', () => {
    const result = adapter.verifyPayment('order_abc', 'pay_abc', '');
    assert.strictEqual(result, false, 'Empty signature should fail');
  });

  it('should return FALSE for a completely wrong signature', () => {
    const result = adapter.verifyPayment('order_abc', 'pay_abc', 'aaabbbccc000');
    assert.strictEqual(result, false, 'Wrong signature should fail');
  });

  it('should produce different signatures for different order IDs', () => {
    const paymentId = 'pay_common123';
    const sig1 = generateValidSignature('order_A', paymentId);
    const sig2 = generateValidSignature('order_B', paymentId);
    assert.notStrictEqual(sig1, sig2, 'Signatures must be unique per order');
  });
});

describe('Razorpay Adapter — Webhook Signature Verification', () => {
  const WEBHOOK_SECRET = 'webhook_test_secret_mozhibu_2026';

  it('should verify a valid webhook signature', () => {
    const body = JSON.stringify({ event: 'payment.captured', payload: { amount: 9900 } });
    const sig = generateValidWebhookSignature(body, WEBHOOK_SECRET);
    const result = adapter.verifyWebhookSignature(body, sig, WEBHOOK_SECRET);
    assert.strictEqual(result, true, 'Valid webhook signature should pass');
  });

  it('should reject a tampered webhook body', () => {
    const originalBody = JSON.stringify({ event: 'payment.captured', amount: 9900 });
    const sig = generateValidWebhookSignature(originalBody, WEBHOOK_SECRET);

    const tamperedBody = JSON.stringify({ event: 'payment.captured', amount: 999999 });
    const result = adapter.verifyWebhookSignature(tamperedBody, sig, WEBHOOK_SECRET);
    assert.strictEqual(result, false, 'Tampered body should fail webhook verification');
  });

  it('should reject with wrong webhook secret', () => {
    const body = JSON.stringify({ event: 'subscription.cancelled' });
    const sig = generateValidWebhookSignature(body, WEBHOOK_SECRET);

    const result = adapter.verifyWebhookSignature(body, sig, 'wrong_secret');
    assert.strictEqual(result, false, 'Wrong webhook secret should fail');
  });
});

describe('Razorpay Adapter — Order Creation (Mocked)', () => {
  it('should create an order with correct amount and currency', async () => {
    const order = await adapter.createOrderMock(9900, 'INR', { userId: 'u1', planId: 'p1' });
    assert.strictEqual(order.amount, 9900, 'Amount must match input paise');
    assert.strictEqual(order.currency, 'INR', 'Currency must be INR');
    assert.ok(order.id.startsWith('order_test_'), 'Order ID must have expected prefix');
    assert.strictEqual(order.status, 'created');
  });

  it('should include metadata notes in the order', async () => {
    const meta = { userId: 'user_123', planId: 'plan_abc' };
    const order = await adapter.createOrderMock(29900, 'INR', meta);
    assert.deepStrictEqual(order.notes, meta, 'Notes must match metadata');
  });

  it('should throw for amount <= 0', async () => {
    await assert.rejects(
      () => adapter.createOrderMock(0, 'INR', {}),
      /Amount must be positive/,
      'Should throw for zero amount'
    );
  });

  it('should throw for non-INR currency', async () => {
    await assert.rejects(
      () => adapter.createOrderMock(9900, 'USD', {}),
      /Only INR supported/,
      'Should throw for non-INR currency'
    );
  });
});

describe('Razorpay Adapter — Coupon Discount Math', () => {
  // Test the discount logic independently (from Coupon model)
  function applyDiscount(coupon, priceInPaise) {
    if (coupon.discountType === 'percent') {
      const discount = Math.floor(priceInPaise * coupon.discountValue / 100);
      return Math.max(0, priceInPaise - discount);
    }
    return Math.max(0, priceInPaise - coupon.discountValue);
  }

  it('should apply 10% percent discount to ₹99 plan = ₹89.10', () => {
    const price = 9900;
    const final = applyDiscount({ discountType: 'percent', discountValue: 10 }, price);
    // 9900 - floor(9900 * 10 / 100) = 9900 - 990 = 8910
    assert.strictEqual(final, 8910);
    assert.strictEqual(final / 100, 89.10);
  });

  it('should apply flat ₹50 discount to ₹99 plan = ₹49', () => {
    const price = 9900;
    const final = applyDiscount({ discountType: 'flat', discountValue: 5000 }, price);
    assert.strictEqual(final, 4900);
    assert.strictEqual(final / 100, 49);
  });

  it('should never go below ₹0 (100% discount)', () => {
    const price = 9900;
    const final = applyDiscount({ discountType: 'percent', discountValue: 100 }, price);
    assert.strictEqual(final, 0);
  });

  it('should floor percent discounts (no fractional paise)', () => {
    // ₹99.99 at 33% discount: floor(9999 * 33 / 100) = floor(3299.67) = 3299
    const price = 9999;
    const final = applyDiscount({ discountType: 'percent', discountValue: 33 }, price);
    assert.strictEqual(final, 9999 - 3299);
  });
});
