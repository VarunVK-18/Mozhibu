const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const usersRouter = require("../src/routes/users");
const authRouter = require("../src/routes/auth");
const adminRouter = require("../src/routes/admin");
const User = require("../src/models/User");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

describe("Timed Account Suspension & Expiration Workflow", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mozhibu_test"
      );
    }
  }, 15000);

  afterAll(async () => {
    await User.deleteMany({
      email: {
        $in: [
          "timed24h@test.com",
          "timedperm@test.com",
          "timedexpired@test.com",
        ],
      },
    });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }, 15000);

  let adminUser, adminToken;

  beforeEach(async () => {
    await User.deleteMany({
      email: {
        $in: [
          "admin_timed@test.com",
          "timed24h@test.com",
          "timedperm@test.com",
          "timedexpired@test.com",
        ],
      },
    });

    adminUser = await User.create({
      username: "SuperAdminTimed",
      email: "admin_timed@test.com",
      password: "hashedpassword123",
      mobile: "9999999900",
      preferredLanguage: "English",
      status: "active",
      role: "superadmin",
    });

    adminToken = jwt.sign(
      { user: { id: adminUser._id, role: "superadmin" } },
      JWT_SECRET
    );
  });

  it("should calculate 24h suspension expiration and return remaining time on login attempt", async () => {
    const user = await User.create({
      username: "Timed24hUser",
      email: "timed24h@test.com",
      password: "hashedpassword123",
      mobile: "9999999901",
      preferredLanguage: "English",
      status: "active",
      role: "writer",
    });

    // Admin suspends for 24h
    const adminRes = await request(app)
      .put(`/api/admin/users/${user._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "suspended", duration: "24h" });

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.status).toBe("suspended");
    expect(adminRes.body.suspendedUntil).toBeDefined();

    // User attempts to log in
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "timed24h@test.com", password: "anypassword" });

    expect(loginRes.statusCode).toBe(403);
    expect(loginRes.body.code).toBe("ACCOUNT_SUSPENDED");
    expect(loginRes.body.msg).toMatch(
      /Your account has been suspended\. Please try again after/i
    );
    expect(loginRes.body.remaining).toMatch(/hour/i);
  });

  it("should handle permanent suspension without remaining hours", async () => {
    const user = await User.create({
      username: "TimedPermUser",
      email: "timedperm@test.com",
      password: "hashedpassword123",
      mobile: "9999999902",
      preferredLanguage: "English",
      status: "active",
      role: "writer",
    });

    // Admin suspends permanently
    const adminRes = await request(app)
      .put(`/api/admin/users/${user._id}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "suspended", duration: "permanent" });

    expect(adminRes.statusCode).toBe(200);
    expect(adminRes.body.status).toBe("suspended");
    expect(adminRes.body.suspendedUntil).toBeNull();

    // User attempts to log in
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "timedperm@test.com", password: "anypassword" });

    expect(loginRes.statusCode).toBe(403);
    expect(loginRes.body.code).toBe("ACCOUNT_SUSPENDED");
    expect(loginRes.body.msg).toBe(
      "Your account has been permanently suspended. Please contact support."
    );
  });

  it("should automatically reactivate an expired suspended user upon login attempt", async () => {
    const user = await User.create({
      username: "TimedExpiredUser",
      email: "timedexpired@test.com",
      password: "hashedpassword123",
      mobile: "9999999903",
      preferredLanguage: "English",
      status: "suspended",
      suspendedUntil: new Date(Date.now() - 5000), // Expired 5 seconds ago
      role: "writer",
    });

    // User attempts to log in
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "timedexpired@test.com", password: "wrongpassword" });

    // Since user was expired, suspension check passes and it reaches password check (400 Wrong password) instead of 403 ACCOUNT_SUSPENDED
    expect(loginRes.statusCode).toBe(400);
    expect(loginRes.body.msg).toBe("Wrong password");

    // Verify DB user is now active
    const updatedInDb = await User.findById(user._id);
    expect(updatedInDb.status).toBe("active");
    expect(updatedInDb.suspendedUntil).toBeNull();
  });
});
