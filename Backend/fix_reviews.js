const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  rating: { type: Number },
  comment: { type: String },
  status: { type: String, default: 'pending' },
});

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);

const fixReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find all reviews
    const reviews = await Review.find();
    console.log(`Found ${reviews.length} reviews`);

    let count = 0;
    for (let i = 0; i < reviews.length; i++) {
      // Make some of them 0 to show in comments tab
      if (i % 2 !== 0) {
        reviews[i].rating = 0;
        await reviews[i].save();
        count++;
      }
    }

    console.log(`Updated ${count} reviews to be 'Comments' (rating: 0)`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixReviews();
