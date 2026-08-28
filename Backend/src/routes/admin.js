const express = require("express");
const { protect, superadmin } = require("../middleware/auth");
const User = require("../models/User");
const Book = require("../models/Book");
const Notification = require("../models/Notification");
const Broadcast = require("../models/Broadcast");
const SubscriptionPlan = require("../models/SubscriptionPlan");
const SubscriptionPlanHistory = require("../models/SubscriptionPlanHistory");
const UserSubscription = require("../models/UserSubscription");

const router = express.Router();

// All routes here are protected and require superadmin
router.use(protect);
router.use(superadmin);

// @route GET /api/admin/stats
// @desc Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const totalPublishedBooks = await Book.countDocuments({
      status: "published",
    });
    const totalReaders = await User.countDocuments({ role: "reader" });
    const totalWriters = await User.countDocuments({ role: "writer" });
    const pendingBooks = await Book.countDocuments({ status: "pending" });
    const totalAuthors = await User.countDocuments({
      role: { $in: ["writer", "superadmin"] },
    });

    // Time-series aggregations for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const booksAggregation = await Book.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const usersAggregation = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const format12Months = (aggData) => {
      const data = new Array(12).fill(0);
      const labels = new Array(12).fill("");
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels[11 - i] = d.toLocaleString("default", { month: "short" });
        const found = aggData.find(
          (item) =>
            item._id.month === d.getMonth() + 1 &&
            item._id.year === d.getFullYear(),
        );
        if (found) data[11 - i] = found.count;
      }
      return { data, labels };
    };

    const monthlyBooks = format12Months(booksAggregation);
    const monthlyUsers = format12Months(usersAggregation);

    res.json({
      totalPublishedBooks,
      totalUsers: totalReaders + totalWriters,
      readers: totalReaders,
      writers: totalWriters,
      totalAuthors,
      pendingBooks,
      monthlyBooksData: monthlyBooks.data,
      monthlyUsersData: monthlyUsers.data,
      chartLabels: monthlyBooks.labels,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/books
// @desc Get all books with optional status filter
router.get("/books", async (req, res) => {
  try {
    const status = req.query.status;
    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }
    const books = await Book.find(query)
      .populate("author", "username email")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/reported-books
// @desc Get all books with more than 10 reports
router.get("/reported-books", async (req, res) => {
  try {
    const books = await Book.find({
      reportCount: { $gt: 10 },
      status: { $ne: "suspended" },
    })
      .populate("author", "username email")
      .sort({ reportCount: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/books/:id
// @desc Get book details
router.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      "author",
      "username email",
    );
    if (!book) return res.status(404).json({ msg: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/admin/books/:id/status
// @desc Update book status (approve/reject)
router.put("/books/:id/status", async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!["pending", "published", "rejected", "suspended"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: "Book not found" });

    book.status = status;
    if (status === "rejected") {
      book.rejectionReason = rejectionReason || "No reason provided";
    }
    if (status === "published" && book.status !== "published") {
      book.rejectionReason = undefined;
    }
    const previousStatus = book.status;
    book.status = status;
    book.reviewedAt = Date.now();
    book.reviewedBy = req.user.id;

    await book.save();

    // If newly published, notify followers
    if (status === "published" && previousStatus !== "published") {
      const User = require("../models/User");
      const Notification = require("../models/Notification");

      const author = await User.findById(book.author);
      if (author) {
        const followers = await User.find({ following: author._id }).select(
          "_id",
        );
        if (followers.length > 0) {
          const notifications = followers.map((f) => ({
            recipient: f._id,
            sender: author._id,
            type: "new_chapter", // Re-using new_chapter or creating a new type
            title: "New Book Published",
            message: `${author.username} has just published a new book: ${book.title}`,
            link: `/story/${book._id}`,
          }));
          await Notification.insertMany(notifications);

          const io = req.app.get("io");
          const userSockets = req.app.get("userSockets");
          if (io && userSockets) {
            followers.forEach((f) => {
              const socketId = userSockets.get(f._id.toString());
              if (socketId) {
                io.to(socketId).emit("incoming_notification");
              }
            });
          }
        }
      }
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/users
// @desc Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/admin/users/:id/status
// @desc Suspend or reactivate user
router.put("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.status = status;
    await user.save();
    res.json({ id: user.id, status: user.status });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/admin/users/:id
// @desc Delete user/author account permanently by admin
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Find and delete all books of the user
    const books = await Book.find({ author: userId });
    const bookIds = books.map((b) => b._id);

    // Delete chapters
    const Chapter = require("../models/Chapter");
    await Chapter.deleteMany({ book: { $in: bookIds } });

    // Delete reviews on author's books or written by user
    const Review = require("../models/Review");
    await Review.deleteMany({ book: { $in: bookIds } });
    await Review.deleteMany({ user: userId });

    // Delete reading progress
    const ReadingProgress = require("../models/ReadingProgress");
    await ReadingProgress.deleteMany({
      $or: [{ user: userId }, { book: { $in: bookIds } }],
    });

    // Delete books
    await Book.deleteMany({ author: userId });

    // Remove user from other users' following arrays
    await User.updateMany({}, { $pull: { following: userId } });

    // Delete the user itself
    await User.findByIdAndDelete(userId);

    res.json({
      msg: "User account and all related content deleted successfully",
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/authors
// @desc Get authors with their published book count
router.get("/authors", async (req, res) => {
  try {
    const authors = await User.find({
      role: { $in: ["writer", "superadmin"] },
    }).select("username email createdAt status");

    // In a real production app, use MongoDB aggregation for performance
    const authorStats = await Promise.all(
      authors.map(async (author) => {
        const publishedCount = await Book.countDocuments({
          author: author._id,
          status: "published",
        });
        // Total reads is tricky if views are not tracked accurately, we sum up views of books
        const authorBooks = await Book.find({
          author: author._id,
          status: "published",
        });
        const totalReads = authorBooks.reduce(
          (sum, book) => sum + book.views,
          0,
        );

        return {
          _id: author._id,
          username: author.username,
          email: author.email,
          status: author.status,
          joinedAt: author.createdAt,
          publishedCount,
          totalReads,
        };
      }),
    );

    res.json(authorStats);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/authors/:id
// @desc Get author profile details and their books
router.get("/authors/:id", async (req, res) => {
  try {
    const author = await User.findById(req.params.id).select("-password");
    if (!author) return res.status(404).json({ msg: "Author not found" });

    const books = await Book.find({ author: req.params.id }).sort({
      createdAt: -1,
    });

    res.json({
      author,
      books,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/pending-authors
// @desc Get users requesting author status
router.get("/pending-authors", async (req, res) => {
  try {
    const pendingAuthors = await User.find({ authorStatus: "pending" }).select(
      "username email createdAt status authorStatus",
    );
    res.json(pendingAuthors);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/admin/pending-authors/:id/status
// @desc Approve or reject an author request
router.put("/pending-authors/:id/status", async (req, res) => {
  try {
    const { action } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res
        .status(400)
        .json({ msg: "Invalid action. Use approve or reject." });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.authorStatus !== "pending")
      return res.status(400).json({ msg: "User is not pending approval" });

    if (action === "approve") {
      user.role = "writer";
      user.authorStatus = "approved";
    } else {
      user.authorStatus = "rejected";
    }

    await user.save();
    res.json({ id: user.id, role: user.role, authorStatus: user.authorStatus });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/admin/broadcast
// @desc Broadcast announcement to users
router.post("/broadcast", async (req, res) => {
  try {
    const { title, message, audience } = req.body;

    if (!title || !message || !audience) {
      return res
        .status(400)
        .json({ msg: "Please provide title, message, and audience" });
    }

    const validAudiences = ["all", "readers", "writers"];
    if (!validAudiences.includes(audience)) {
      return res.status(400).json({ msg: "Invalid audience type" });
    }

    let query = { _id: { $ne: req.user.id } };
    if (audience === "readers") {
      query.role = "reader";
    } else if (audience === "writers") {
      query.role = { $in: ["writer", "superadmin"] };
    }

    const users = await User.find(query).select("_id");

    if (users.length === 0) {
      return res.status(400).json({ msg: "No users found for this audience" });
    }

    const notifications = users.map((user) => ({
      recipient: user._id,
      type: "announcement",
      title: title,
      message: message,
      isRead: false,
    }));

    await Notification.insertMany(notifications);

    // Save broadcast history
    const broadcastRecord = new Broadcast({
      title,
      message,
      audience,
      sentBy: req.user.id,
    });
    await broadcastRecord.save();

    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");

    if (io && userSockets) {
      users.forEach((user) => {
        const socketId = userSockets.get(user._id.toString());
        if (socketId) {
          io.to(socketId).emit("incoming_notification");
        }
      });
    }

    res.json({
      msg: `Announcement sent successfully to ${users.length} users.`,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/broadcasts
// @desc Get broadcast history
router.get("/broadcasts", async (req, res) => {
  try {
    const broadcasts = await Broadcast.find()
      .populate("sentBy", "username email")
      .sort({ createdAt: -1 });
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/admin/broadcasts/:id
// @desc Delete a broadcast from history
router.delete("/broadcasts/:id", async (req, res) => {
  try {
    const broadcast = await Broadcast.findById(req.params.id);
    if (!broadcast) {
      return res.status(404).json({ msg: "Broadcast not found" });
    }

    await broadcast.deleteOne();
    res.json({ msg: "Broadcast deleted from history" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

const Competition = require("../models/Competition");

// @route GET /api/admin/competition
// @desc Get competition config
router.get("/competition", async (req, res) => {
  try {
    let competition = await Competition.findOne();
    if (!competition) {
      competition = new Competition();
      await competition.save();
    }

    // Auto-expire if end date has passed
    if (
      competition.isActive &&
      competition.endDate &&
      new Date() > new Date(competition.endDate)
    ) {
      competition.isActive = false;
      await competition.save();
    }

    res.json(competition);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/admin/competition
// @desc Update competition config
router.put("/competition", async (req, res) => {
  try {
    const {
      isActive,
      tag,
      title,
      description,
      endDate,
      buttonText,
      buttonLink,
    } = req.body;
    let competition = await Competition.findOne();

    if (!competition) {
      competition = new Competition();
    }

    if (isActive !== undefined) competition.isActive = isActive;
    if (tag) competition.tag = tag;
    if (title) competition.title = title;
    if (description) competition.description = description;
    if (endDate) competition.endDate = endDate;
    if (buttonText) competition.buttonText = buttonText;
    if (buttonLink) competition.buttonLink = buttonLink;

    await competition.save();
    res.json(competition);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/competition/entries
// @desc Get books submitted to the active competition
router.get("/competition/entries", async (req, res) => {
  try {
    const competition = await Competition.findOne();
    if (!competition || !competition.tag) {
      return res.json([]);
    }

    // Find all published books that have this competition tag
    const entries = await Book.find({
      competitionTag: { $exists: true, $ne: "" },
      status: "published",
    })
      .populate("author", "username email")
      .sort({ createdAt: -1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/admin/competition/notify
// @desc Send a broadcast to writers inviting them to the competition
router.post("/competition/notify", async (req, res) => {
  try {
    const { message } = req.body;

    const broadcast = new Broadcast({
      title: "New Competition Announcement",
      message:
        message || "A new competition has started! Submit your entry now.",
      audience: "writers",
      sentBy: req.user.id,
    });

    await broadcast.save();

    // Notify all writers
    const writers = await User.find({ role: "writer" });
    const notifications = writers.map((user) => ({
      recipient: user._id,
      sender: req.user.id,
      type: "competition",
      title: broadcast.title,
      message: broadcast.message,
      link: "/write/new", // They can click the notification to go straight to submitting
    }));

    await Notification.insertMany(notifications);

    res.json({ msg: "Notification sent successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/admin/competition/announce-winner
// @desc Set the winner and announce it to everyone
router.post("/competition/announce-winner", async (req, res) => {
  try {
    const { bookId } = req.body;
    const competition = await Competition.findOne();
    if (!competition)
      return res.status(404).json({ msg: "No competition found" });

    const winningBook = await Book.findById(bookId).populate(
      "author",
      "username",
    );
    if (!winningBook) return res.status(404).json({ msg: "Book not found" });

    competition.winnerBookId = bookId;
    competition.isActive = false; // Competition is over
    await competition.save();

    // Announce to EVERYONE
    const broadcast = new Broadcast({
      title: "Competition Winner Announced!",
      message: `The competition "${competition.title}" has concluded. Congratulations to ${winningBook.author.username} for their winning book "${winningBook.title}"!`,
      audience: "all",
      sentBy: req.user.id,
    });
    await broadcast.save();

    const allUsers = await User.find({});
    const notifications = allUsers.map((user) => ({
      recipient: user._id,
      sender: req.user.id,
      type: "announcement",
      title: broadcast.title,
      message: broadcast.message,
      link: `/book/${bookId}`, // Link straight to the winning book
    }));
    await Notification.insertMany(notifications);

    res.json({ msg: "Winner announced successfully!", competition });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// --- SUBSCRIPTION PLAN MANAGEMENT ---

// @route GET /api/admin/plans
// @desc Get all subscription plans
router.get("/plans", async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({
      displayOrder: 1,
      createdAt: -1,
    });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/admin/plans
// @desc Create a new subscription plan
router.post("/plans", async (req, res) => {
  try {
    const {
      name,
      priceInPaise,
      currency,
      durationDays,
      marketingBenefits,
      structuredBenefits,
      terms,
      isActive,
      displayOrder,
    } = req.body;

    const existing = await SubscriptionPlan.findOne({ name, isActive: true });
    if (existing) {
      return res
        .status(400)
        .json({ msg: "An active plan with this name already exists" });
    }

    const plan = new SubscriptionPlan({
      name,
      priceInPaise,
      currency,
      durationDays,
      marketingBenefits,
      structuredBenefits,
      terms,
      isActive,
      displayOrder,
      createdBy: req.user.id,
    });

    await plan.save();

    await SubscriptionPlanHistory.create({
      planId: plan._id,
      fieldChanged: "created",
      newValue: plan,
      changedBy: req.user.id,
    });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PUT /api/admin/plans/:id
// @desc Update a subscription plan
router.put("/plans/:id", async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ msg: "Plan not found" });

    const oldValues = { ...plan.toObject() };
    const updates = [
      "name",
      "priceInPaise",
      "currency",
      "durationDays",
      "marketingBenefits",
      "structuredBenefits",
      "terms",
      "isActive",
      "displayOrder",
    ];
    let changed = false;

    for (let field of updates) {
      if (
        req.body[field] !== undefined &&
        JSON.stringify(plan[field]) !== JSON.stringify(req.body[field])
      ) {
        const oldVal = plan[field];
        plan[field] = req.body[field];

        await SubscriptionPlanHistory.create({
          planId: plan._id,
          fieldChanged: field,
          oldValue: oldVal,
          newValue: req.body[field],
          changedBy: req.user.id,
        });
        changed = true;
      }
    }

    if (changed) {
      await plan.save();
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route PATCH /api/admin/plans/:id/status
// @desc Toggle active status of a plan
router.patch("/plans/:id/status", async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ msg: "Plan not found" });

    const oldVal = plan.isActive;
    plan.isActive = !plan.isActive;
    await plan.save();

    await SubscriptionPlanHistory.create({
      planId: plan._id,
      fieldChanged: "isActive",
      oldValue: oldVal,
      newValue: plan.isActive,
      changedBy: req.user.id,
    });

    res.json(plan);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route DELETE /api/admin/plans/:id
// @desc Delete a plan (only if zero subscribers)
router.delete("/plans/:id", async (req, res) => {
  try {
    const subscribersCount = await UserSubscription.countDocuments({
      plan: req.params.id,
    });
    if (subscribersCount > 0) {
      return res
        .status(400)
        .json({
          msg: "Cannot delete plan because it has historical or active subscribers. Please deactivate it instead.",
        });
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);
    await SubscriptionPlanHistory.deleteMany({ planId: req.params.id });

    res.json({ msg: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route GET /api/admin/plans/:id/history
// @desc Get audit trail for a plan
router.get("/plans/:id/history", async (req, res) => {
  try {
    const history = await SubscriptionPlanHistory.find({
      planId: req.params.id,
    })
      .populate("changedBy", "username email")
      .sort({ changedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
