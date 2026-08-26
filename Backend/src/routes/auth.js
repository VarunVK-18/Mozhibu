const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID ||
    "1039454132466-7eo28db3tli7r28ckhhj822pmpi1k8sn.apps.googleusercontent.com",
);

// Fallback secret for development, use env in prod
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

// @route POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log("--- NEW REGISTRATION REQUEST ---");
  console.log("Request Body:", req.body);
  try {
    const {
      username,
      email,
      mobile,
      password,
      preferredLanguage,
      favoriteGenres,
      authProvider,
      role,
    } = req.body;

    // Check if email or username exists
    let userByEmail = await User.findOne({ email });
    let userByUsername = await User.findOne({ username });

    if (userByEmail || userByUsername) {
      return res.status(400).json({ msg: "name and email already taken" });
    }

    if (!authProvider || authProvider === "normal") {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[\x20-\x7E]{8,16}$/;
      if (!password || !passwordRegex.test(password)) {
        return res
          .status(400)
          .json({
            msg: "Password must be 8-16 characters long, contain at least one uppercase letter and one number, and no emojis.",
          });
      }
    }

    let user = new User({
      username,
      email,
      mobile,
      preferredLanguage,
      favoriteGenres,
      authProvider: authProvider || "normal",
      role: role === "writer" ? "writer" : "reader",
      authorStatus: role === "writer" ? "approved" : "none",
    });

    if (user.authProvider === "normal") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          authorStatus: user.authorStatus,
          avatar: user.avatar,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error: " + err.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", {
      email,
      passwordLength: password ? password.length : 0,
    });

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ msg: "Email not registered" });
    }

    // Check status
    if (user.status === "suspended") {
      return res
        .status(403)
        .json({
          msg: "Your account has been suspended. Please contact support.",
        });
    }

    if (user.status === "deactivated") {
      user.status = "active";
      await user.save();
      console.log(`User ${user.email} reactivated upon login`);
    }

    if (user.authProvider !== "normal") {
      return res
        .status(400)
        .json({
          msg: `Please sign in using your ${user.authProvider} account`,
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password" });
    }

    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          authorStatus: user.authorStatus,
          avatar: user.avatar,
        },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience:
        process.env.GOOGLE_CLIENT_ID ||
        "1039454132466-7eo28db3tli7r28ckhhj822pmpi1k8sn.apps.googleusercontent.com",
    });
    const payloadData = ticket.getPayload();
    const email = payloadData.email;
    const name = payloadData.name;
    const picture = payloadData.picture;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      if (user.status === "suspended") {
        return res
          .status(403)
          .json({
            msg: "Your account has been suspended. Please contact support.",
          });
      }
      if (user.status === "deactivated") {
        user.status = "active";
        await user.save();
      }

      // Update auth provider if they previously used normal login but now use google
      if (user.authProvider !== "google") {
        user.authProvider = "google";
        if (picture) user.avatar = picture;
        await user.save();
      }

      const payload = { user: { id: user.id, role: user.role } };
      return jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "5d" },
        (err, token) => {
          if (err) throw err;
          const isProfileComplete = !!(
            user.mobile &&
            user.preferredLanguage &&
            user.mobile !== "Not Provided"
          );
          res.json({
            token,
            isProfileComplete,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              mobile: user.mobile,
              role: user.role,
              authorStatus: user.authorStatus,
              avatar: user.avatar,
            },
          });
        },
      );
    }

    // User does not exist, directly create them in the database
    // Generate a username from name
    let baseUsername =
      name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user";
    let username = baseUsername;
    let userExists = await User.findOne({ username });
    let counter = 1;
    while (userExists) {
      username = baseUsername + counter;
      userExists = await User.findOne({ username });
      counter++;
    }

    user = new User({
      username: username,
      email: email,
      mobile: "Not Provided",
      preferredLanguage: "en",
      favoriteGenres: [],
      avatar: picture,
      authProvider: "google",
      role: "reader",
      authorStatus: "none",
    });

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "5d" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        isProfileComplete: false,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          authorStatus: user.authorStatus,
          avatar: user.avatar,
        },
      });
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(400).json({ msg: "Invalid Google token" });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate reset token and print link
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "There is no user with that email" });
    }

    if (user.authProvider !== "normal") {
      return res
        .status(400)
        .json({
          msg: `You signed up with ${user.authProvider}, password reset is not applicable.`,
        });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:4200";
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Mozhibu Story" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Mozhibu - Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.username},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #2F4F4F; text-decoration: none; border-radius: 5px; margin-top: 10px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">This link is valid for 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      res.json({ msg: "Password reset link has been sent to your email." });
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);

      // Reset the token fields if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      // If email fails (e.g. invalid credentials), still print to console for development
      console.log("\n--- EMAIL FAILED. PASSWORD RESET LINK ---");
      console.log(resetUrl);
      console.log("-----------------------------------------\n");

      return res
        .status(500)
        .json({
          msg: "Email could not be sent. Please check backend console for the link.",
        });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired reset token" });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[\x20-\x7E]{8,16}$/;
    if (!password || !passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          msg: "Password must be 8-16 characters long, contain at least one uppercase letter and one number, and no emojis.",
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: "Password successfully updated! You can now log in." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
