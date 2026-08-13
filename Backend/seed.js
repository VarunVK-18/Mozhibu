require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./src/models/Book');
const Chapter = require('./src/models/Chapter');
const Review = require('./src/models/Review');
const User = require('./src/models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Delete all existing books, chapters, and reviews
    await Book.deleteMany({});
    await Chapter.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing books, chapters, and reviews');

    // 2. Ensure we have 3 author users
    const authors = await User.find({ role: { $in: ['writer', 'superadmin'] } }).limit(3);
    
    // If not enough authors, we'll assign books to the first user found (or superadmin)
    const fallbackAuthor = await User.findOne({ role: 'superadmin' }) || await User.findOne();
    
    const author1 = authors[0] || fallbackAuthor;
    const author2 = authors[1] || fallbackAuthor;
    const author3 = authors[2] || fallbackAuthor;

    if (!author1) {
        console.error('No users found in database to act as authors! Please register a user first.');
        process.exit(1);
    }

    // 3. Inject 3 trending books
    const book1 = new Book({
      title: 'The Silent Echo',
      author: author1._id,
      cover: 'https://images.unsplash.com/photo-1629196914275-01ce8d9d40a6?w=500&q=80',
      genre: 'Thriller',
      description: 'A gripping tale of mystery in a small coastal town where echoes from the past refuse to stay buried.',
      status: 'published',
      views: 15420,
      rating: 4.8,
      likesCount: 3200,
      originalLanguage: 'English',
      accessType: 'free'
    });
    
    const book2 = new Book({
      title: 'காதல் மழை (Rain of Love)',
      author: author2._id,
      cover: 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=500&q=80',
      genre: 'Romance',
      description: 'இரண்டு வெவ்வேறு துருவங்களைச் சேர்ந்த இதயங்கள் மழையில் எப்படி இணைகின்றன என்பதைச் சொல்லும் இனிமையான கதை.',
      status: 'published',
      views: 28900,
      rating: 4.9,
      likesCount: 8900,
      originalLanguage: 'Tamil',
      accessType: 'premium' // Premium Story
    });

    const book3 = new Book({
      title: 'एक अनकही कहानी (An Untold Story)',
      author: author3._id,
      cover: 'https://images.unsplash.com/photo-1522096823084-2d1aa8411c13?w=500&q=80',
      genre: 'Drama',
      description: 'समाज की सच्चाई और एक संघर्षरत परिवार की अनकही कहानी जो दिलों को छू लेगी।',
      status: 'published',
      views: 12050,
      rating: 4.6,
      likesCount: 1500,
      originalLanguage: 'Hindi',
      accessType: 'free'
    });

    await book1.save();
    await book2.save();
    await book3.save();

    console.log('Books created');

    // 4. Create Chapters
    const createChapters = async (bookId, language, isPremium) => {
      await new Chapter({
        book: bookId,
        title: 'Chapter 1: The Beginning',
        content: '<p>This is the first chapter. The journey begins here. A lot of exciting things happen!</p>',
        order: 1,
        status: 'published',
        accessType: 'free' // First chapter usually free
      }).save();

      await new Chapter({
        book: bookId,
        title: 'Chapter 2: The Twist',
        content: '<p>Things take an unexpected turn in this chapter. The plot thickens significantly.</p>',
        order: 2,
        status: 'published',
        accessType: isPremium ? 'premium' : 'inherit'
      }).save();
    };

    await createChapters(book1._id, 'English', false);
    await createChapters(book2._id, 'Tamil', true);
    await createChapters(book3._id, 'Hindi', false);

    console.log('Chapters created successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
