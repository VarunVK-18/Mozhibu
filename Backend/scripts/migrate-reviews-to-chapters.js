require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Review = require('../src/models/Review');
const Chapter = require('../src/models/Chapter');
const Book = require('../src/models/Book');

async function migrateReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const reviews = await Review.find({ chapter: { $exists: false } });
    console.log(`Found ${reviews.length} reviews to migrate.`);

    for (const review of reviews) {
      if (!review.book) continue;

      // Find the first chapter of the book
      const firstChapter = await Chapter.findOne({ book: review.book }).sort({ order: 1 });
      
      if (firstChapter) {
        review.chapter = firstChapter._id;
        await review.save();
        console.log(`Migrated review ${review._id} to chapter ${firstChapter._id}`);
      } else {
        console.log(`Warning: Review ${review._id} belongs to book ${review.book} but no chapters found. Skipping.`);
      }
    }

    console.log('Recalculating Chapter ratings...');
    const allChapters = await Chapter.find();
    for (const chapter of allChapters) {
      const chapterReviews = await Review.find({ chapter: chapter._id, rating: { $exists: true, $ne: null } });
      
      let sum = 0;
      let count = 0;
      
      for (const r of chapterReviews) {
        if (r.rating > 0) {
          sum += r.rating;
          count++;
        }
      }

      chapter.rating = count > 0 ? (sum / count) : 0;
      chapter.reviewCount = count;
      await chapter.save();
    }

    console.log('Recalculating Book ratings...');
    const allBooks = await Book.find();
    for (const book of allBooks) {
      const chapters = await Chapter.find({ book: book._id, reviewCount: { $gt: 0 } });
      
      let sum = 0;
      let count = chapters.length;

      for (const c of chapters) {
        sum += c.rating;
      }

      book.rating = count > 0 ? (sum / count) : 0;
      await book.save();
    }

    console.log('Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateReviews();
