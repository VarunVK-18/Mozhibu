const mongoose = require('mongoose');
const User = require('./src/models/User'); // ADDED THIS
const Book = require('./src/models/Book');
const Review = require('./src/models/Review');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  try {
    const bookId = "6a8d13b19d3cc32c74619325";
    const reviews = await Review.find({ book: bookId });
    if (reviews.length === 0) {
      console.log('No reviews found for book');
      return;
    }
    const review = reviews[0];
    console.log('Found review:', review._id);
    
    // Simulate what the route does
    const rating = 4;
    const content = "Testing 123";
    
    if (content !== undefined) review.comment = content;
    if (rating !== undefined && !review.parentReview) {
      review.rating = rating;
    }
    
    review.isEdited = true;
    
    try {
      await review.save();
      console.log('Review saved successfully');
    } catch(e) {
      console.log('Error saving review:', e.message);
      return;
    }
    
    if (!review.parentReview) {
      const book = await Book.findById(review.book);
      if (book) {
        const allReviews = await Review.find({
          book: review.book,
          status: "approved",
          parentReview: { $exists: false },
        });
        
        let avgRating = 0;
        if (allReviews.length > 0) {
          avgRating = allReviews.reduce((acc, item) => (item.rating || 0) + acc, 0) / allReviews.length;
        }
        book.rating = avgRating;
        await book.save();
        console.log('Book saved successfully');
      }
    }
    
    await review.populate("user", "username avatar isPremium");
    console.log('Populate successful');
    
  } catch (err) {
    console.error('Error occurred:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

test();
