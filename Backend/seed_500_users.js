const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const User = require("./src/models/User");

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    const passwordHash = await bcrypt.hash("Password123", 10);
    const users = [];

    for (let i = 1; i <= 500; i++) {
      users.push({
        username: `testuser${i}`,
        email: `user${i}@gmail.com`,
        mobile: `555000${i.toString().padStart(4, '0')}`,
        password: passwordHash,
        preferredLanguage: "English",
        favoriteGenres: ["Fiction"],
        isOnboarded: true
      });
    }

    // Use insertMany to efficiently seed 500 users at once
    console.log("Inserting 500 users...");
    await User.insertMany(users, { ordered: false });
    console.log("Successfully seeded 500 users!");

  } catch (error) {
    if (error.code === 11000) {
      console.log("Some users already exist (duplicate emails ignored).");
    } else {
      console.error("Error seeding users:", error);
    }
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedUsers();
