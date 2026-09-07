const mongoose = require("mongoose");
const Chapter = require("../src/models/Chapter");
const Book = require("../src/models/Book");
const User = require("../src/models/User");
const Notification = require("../src/models/Notification");
require("dotenv").config();

// We need a helper to run the exact logic from the cron job without waiting for cron
async function triggerScheduledPublish() {
  const now = new Date();
  const chaptersToPublish = await Chapter.find({
    status: "scheduled",
    scheduledAt: { $lte: now },
  });

  for (const chapter of chaptersToPublish) {
    chapter.status = "published";
    await chapter.save();

    const book = await Book.findById(chapter.book);
    if (book) {
      const followers = await User.find({ following: book.author });
      const notifications = followers.map((follower) => ({
        recipient: follower._id,
        sender: book.author,
        type: "new_chapter",
        title: "New Chapter Published",
        message: `A new chapter for "${book.title}" is now available.`,
        link: `/story/${book._id}/read/${chapter._id}`,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  }
}

describe("Scheduled Publish Logic", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mozhibu_test"
      );
    }
  }, 15000);

  afterAll(async () => {
    await Chapter.deleteMany({ title: "Scheduled Chapter 1" });
    await Book.deleteMany({ title: "Scheduled Book" });
    await User.deleteMany({
      email: { $in: ["author@test.com", "follower@test.com"] },
    });
    await Notification.deleteMany({ title: "New Chapter Published" });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }, 15000);

  beforeEach(async () => {
    await Chapter.deleteMany({ title: "Scheduled Chapter 1" });
    await Book.deleteMany({ title: "Scheduled Book" });
    await User.deleteMany({
      email: { $in: ["author@test.com", "follower@test.com"] },
    });
    await Notification.deleteMany({ title: "New Chapter Published" });
  });

  it("should publish scheduled chapters and notify followers", async () => {
    // 1. Setup Data
    const author = new User({
      username: "testauthor",
      email: "author@test.com",
      mobile: "1234567890",
      preferredLanguage: "English",
      favoriteGenres: ["Fiction"],
    });
    await author.save();

    const follower = new User({
      username: "testfollower",
      email: "follower@test.com",
      mobile: "0987654321",
      preferredLanguage: "English",
      favoriteGenres: ["Fiction"],
      following: [author._id],
    });
    await follower.save();

    const book = new Book({
      title: "Scheduled Book",
      author: author._id,
      genre: "Fiction",
    });
    await book.save();

    // A chapter scheduled 5 minutes ago (should be published)
    const pastScheduledDate = new Date();
    pastScheduledDate.setMinutes(pastScheduledDate.getMinutes() - 5);

    const chapterToPublish = new Chapter({
      book: book._id,
      title: "Chapter 1",
      content: "Content 1",
      order: 1,
      status: "scheduled",
      scheduledAt: pastScheduledDate,
    });
    await chapterToPublish.save();

    // A chapter scheduled 5 minutes in the future (should NOT be published)
    const futureScheduledDate = new Date();
    futureScheduledDate.setMinutes(futureScheduledDate.getMinutes() + 5);

    const chapterToWait = new Chapter({
      book: book._id,
      title: "Chapter 2",
      content: "Content 2",
      order: 2,
      status: "scheduled",
      scheduledAt: futureScheduledDate,
    });
    await chapterToWait.save();

    // 2. Run the logic
    await triggerScheduledPublish();

    // 3. Verify
    const updatedChapter1 = await Chapter.findById(chapterToPublish._id);
    expect(updatedChapter1.status).toBe("published");

    const updatedChapter2 = await Chapter.findById(chapterToWait._id);
    expect(updatedChapter2.status).toBe("scheduled"); // Still scheduled

    // Check notifications
    const notifications = await Notification.find({ recipient: follower._id });
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe("new_chapter");
    expect(notifications[0].sender.toString()).toBe(author._id.toString());
  });
});
