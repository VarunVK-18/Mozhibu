/**
 * Payment Gateway Abstraction Layer
 * Supports pluggable providers via adapter pattern.
 * Currently implemented: Razorpay
 */

const Razorpay = require("razorpay");
const crypto = require("crypto");

// ─── Base Interface ───────────────────────────────────────────
class PaymentGateway {
  async createOrder(amountInPaise, currency, metadata) {
    throw new Error("createOrder() must be implemented by adapter");
  }
  async verifyPayment(orderId, paymentId, signature) {
    throw new Error("verifyPayment() must be implemented by adapter");
  }
  async refund(paymentId, amountInPaise) {
    throw new Error("refund() must be implemented by adapter");
  }
  verifyWebhookSignature(body, signature, secret) {
    throw new Error("verifyWebhookSignature() must be implemented by adapter");
  }
}

// ─── Razorpay Adapter ─────────────────────────────────────────
class RazorpayAdapter extends PaymentGateway {
  constructor() {
    super();
    this.client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Creates a Razorpay order.
   * @param {number} amountInPaise - e.g. 9900 for ₹99
   * @param {string} currency - 'INR'
   * @param {object} metadata - { userId, planId, couponCode }
   * @returns Razorpay order object
   */
  async createOrder(amountInPaise, currency = "INR", metadata = {}) {
    const order = await this.client.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `sub_${Date.now()}`,
      notes: metadata,
    });
    return order;
  }

  /**
   * Verifies the HMAC signature sent by Razorpay on payment capture.
   */
  verifyPayment(orderId, paymentId, signature) {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
    return expectedSignature === signature;
  }

  /**
   * Verifies an incoming webhook event from Razorpay.
   */
  verifyWebhookSignature(rawBody, signature, secret) {
    const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    return expectedSignature === signature;
  }

  /**
   * Initiates a refund for a payment.
   */
  async refund(paymentId, amountInPaise) {
    return await this.client.payments.refund(paymentId, {
      amount: amountInPaise,
    });
  }
}

// ─── Factory: returns configured adapter ─────────────────────
const getGateway = (provider = "razorpay") => {
  switch (provider) {
    case "razorpay":
      return new RazorpayAdapter();
    default:
      throw new Error(`Unsupported payment gateway: ${provider}`);
  }
};

module.exports = { getGateway };
