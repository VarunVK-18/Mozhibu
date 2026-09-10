require("dotenv").config();
const mongoose = require("mongoose");
const crypto = require("crypto");
const cryptoUtils = require("./src/utils/crypto");
const User = require("./src/models/User");
const AuthorEarnings = require("./src/models/AuthorEarnings");
const ReaderReward = require("./src/models/ReaderReward");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    await User.deleteMany({ email: { $in: ["mockpayout@example.com", "mockreader@example.com"] } });
    await AuthorEarnings.deleteMany({ sourceType: "royalties", earningsInPaise: 450000 });
    await ReaderReward.deleteMany({ rewardInPaise: { $in: [50000, 35000] } });

    // Create a mock user
    const user = await User.create({
      username: "mockpayoutuser",
      email: "mockpayout@example.com",
      password: "password123",
      role: "writer",
      preferredLanguage: "English",
      mobile: "9988776655",
      monetization: {
        accountName: cryptoUtils.encrypt("John Doe"),
        bankName: cryptoUtils.encrypt("HDFC Bank"),
        accountNumber: cryptoUtils.encrypt("50100234567890"),
        ifscCode: cryptoUtils.encrypt("HDFC0001234")
      }
    });

    console.log("Created user with encrypted bank details:", user.email);

    // Seed Author Earning (Requested)
    await AuthorEarnings.create({
      author: user._id,
      earningsInPaise: 450000, // ₹4,500.00
      sourceType: "royalties",
      status: "requested",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });

    // Seed Reader Reward (Requested)
    await ReaderReward.create({
      user: user._id,
      rewardInPaise: 50000, // ₹500.00
      sourceActivity: "daily_read",
      status: "requested",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });

    console.log("Seeded pending payout requests (Total: ₹5,000.00)");
    
    // Create another mock user
    const user2 = await User.create({
      username: "mockreaderuser",
      email: "mockreader@example.com",
      password: "password123",
      role: "reader",
      preferredLanguage: "English",
      mobile: "5566778899",
      monetization: {
        accountName: cryptoUtils.encrypt("Jane Smith"),
        bankName: cryptoUtils.encrypt("SBI Bank"),
        accountNumber: cryptoUtils.encrypt("30100456789012"),
        ifscCode: cryptoUtils.encrypt("SBIN0001234")
      }
    });

    // Seed Reader Reward (Requested)
    await ReaderReward.create({
      user: user2._id,
      rewardInPaise: 35000, // ₹350.00
      sourceActivity: "competition_win",
      status: "requested",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });

    console.log("Seeded pending reader payout (Total: ₹350.00)");

    console.log("Done seeding payouts!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
