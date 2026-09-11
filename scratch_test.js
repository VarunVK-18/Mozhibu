const mongoose = require('mongoose');
const Book = require('./Backend/src/models/Book');
const Review = require('./Backend/src/models/Review');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/mozhibu');
  
  try {
    // Find a review with no comment
    const review = await Review.findOne({ comment: { $exists: false } });
    if (!review) {
      console.log('No empty review found');
      return;
    }
    
    console.log('Found review:', review._id);
    
    review.comment = "Added text now";
    review.isEdited = true;
    if (review.rating !== undefined && !review.parentReview) {
      review.rating = 5;
    }
    
    await review.save();
    console.log('Review saved successfully');
    
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
    console.error('Error occurred:', err);
  } finally {
    mongoose.connection.close();
  }
}

test();
