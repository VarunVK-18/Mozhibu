/**
 * Seed Script — Creates test subscription plans and initial revenue config.
 * Run once: node src/scripts/seedSubscriptions.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const RevenueSplitConfig = require("../models/RevenueSplitConfig");
const EngagementScoreConfig = require("../models/EngagementScoreConfig");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✓ Connected to MongoDB");

  // ── Subscription Plans ─────────────────────────────────────
  await SubscriptionPlan.deleteMany({});

  const plans = await SubscriptionPlan.insertMany([
    {
      name: "Monthly Premium",
      description: "Perfect for regular readers",
      priceInPaise: 9900, // ₹99/month
      durationDays: 30,
      benefits: [
        "Unlimited premium chapters",
        "Earn monthly reader rewards",
        "Support your favourite authors",
        "Ad-free reading experience",
        "Early access to new releases",
      ],
      isActive: true,
    },
    {
      name: "Quarterly Premium",
      description: "Save 20% — most popular!",
      priceInPaise: 23700, // ₹237 for 3 months (₹79/month)
      durationDays: 90,
      benefits: [
        "Everything in Monthly",
        "20% savings vs monthly",
        "Priority customer support",
        "Exclusive author Q&A access",
        "3x reader reward multiplier",
      ],
      isActive: true,
    },
    {
      name: "Annual Premium",
      description: "Best value — save 50%",
      priceInPaise: 59900, // ₹599/year (₹50/month)
      durationDays: 365,
      benefits: [
        "Everything in Quarterly",
        "50% savings vs monthly",
        "Annual reader reward bonus",
        "Founding member badge",
        "Unlimited language switching",
        "Download for offline reading",
      ],
      isActive: true,
    },
  ]);
  console.log(`✓ Created ${plans.length} subscription plans`);
  plans.forEach((p) =>
    console.log(
      `   • ${p.name} — ₹${(p.priceInPaise / 100).toFixed(0)} / ${p.durationDays} days`,
    ),
  );

  // ── Revenue Split Config ───────────────────────────────────
  const existingConfig = await RevenueSplitConfig.findOne();
  if (!existingConfig) {
    await new RevenueSplitConfig({
      platformPercent: 80,
      authorsPercent: 15,
      readersPercent: 5,
      minAuthorPayoutInPaise: 10000, // ₹100 minimum payout
      minReaderPayoutInPaise: 5000, // ₹50 minimum payout
    }).save();
    console.log("✓ Created revenue split config (80/15/5)");
  } else {
    console.log("✓ Revenue split config already exists — skipping");
  }

  // ── Engagement Score Config ────────────────────────────────
  const existingEngConfig = await EngagementScoreConfig.findOne();
  if (!existingEngConfig) {
    await new EngagementScoreConfig({
      readingCompletionWeight: 40,
      consistencyWeight: 25,
      timeSpentWeight: 20,
      interactionWeight: 15,
      minCompletionPercentToQualify: 30,
      minTimeOnPageSeconds: 60,
    }).save();
    console.log("✓ Created engagement score config");
  } else {
    console.log("✓ Engagement score config already exists — skipping");
  }

  console.log(
    "\n🎉 Seeding complete! Visit http://localhost:4200/subscription/plans",
  );
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
