require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Book = require('./src/models/Book');
const Chapter = require('./src/models/Chapter');
const Review = require('./src/models/Review');
const ReadingProgress = require('./src/models/ReadingProgress');

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await Chapter.deleteMany({});
    await Review.deleteMany({});
    await ReadingProgress.deleteMany({});

    // Superadmin Creation
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('mozhibu123', salt);

    const admin = await User.create({
      username: 'Superadmin',
      email: 'superadmin@mozhibu.com',
      mobile: '0000000000',
      preferredLanguage: 'English',
      favoriteGenres: ['All'],
      authProvider: 'normal',
      password: hashedPassword,
      role: 'superadmin',
      status: 'active',
      createdAt: new Date('2025-01-01')
    });
    console.log('Superadmin created.');

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Writers
    const writers = [];
    const writerNames = ['Arun Kumar', 'Priya Devi', 'Karthik Raj', 'Lakshmi Menon'];
    for (let i = 0; i < writerNames.length; i++) {
      writers.push(await User.create({
        username: writerNames[i],
        email: `writer${i}@example.com`,
        password: hashedPassword,
        role: 'writer',
        mobile: '1234567890',
        preferredLanguage: 'Tamil',
        followersCount: Math.floor(Math.random() * 5000),
        createdAt: getRandomDate(oneYearAgo, now)
      }));
    }

    // Books
    const books = [];
    const titles = ['Monsoon Letters', 'The Silence at Platform 9', 'The Last Ferry to Vaikuntam', 'Shadows of Tomorrow', 'Whispers in the Wind'];
    const covers = [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400'
    ];
    const genres = ['Romance', 'Thriller', 'Mythology', 'Drama', 'Fantasy'];

    for (let i = 0; i < 20; i++) {
      const book = await Book.create({
        title: titles[i % titles.length] + (i > 4 ? ` Vol ${i}` : ''),
        author: writers[i % writers.length]._id,
        cover: covers[i % covers.length],
        genre: genres[i % genres.length],
        views: Math.floor(Math.random() * 50000),
        rating: 3.5 + (Math.random() * 1.5),
        isAudio: i % 3 === 0,
        status: 'published',
        createdAt: getRandomDate(oneYearAgo, now)
      });
      books.push(book);

      // Create 5 Chapters per book
      for (let j = 1; j <= 5; j++) {
        await Chapter.create({
          book: book._id,
          title: `Chapter ${j}`,
          content: `This is the rich content of Chapter ${j} for ${book.title}. `.repeat(20),
          order: j,
          status: 'published'
        });
      }
    }
    
    // Seed standard users and interactions
    const standardUsers = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        username: `User${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        role: 'reader',
        mobile: '1234567890',
        preferredLanguage: 'English',
        savedBooks: [books[0]._id, books[1]._id],
        following: [writers[0]._id],
        createdAt: getRandomDate(oneYearAgo, now)
      });
      standardUsers.push(user);
      
      // Reading Progress
      const firstChapter = await Chapter.findOne({ book: books[0]._id, order: 2 });
      if (firstChapter) {
        await ReadingProgress.create({
          user: user._id,
          book: books[0]._id,
          currentChapter: firstChapter._id,
          progressPercentage: 40
        });
      }

      // Reviews
      await Review.create({
        user: user._id,
        book: books[0]._id,
        rating: 5,
        comment: 'Absolutely stunning read!',
        status: 'approved'
      });
    }

    // Give Superadmin some library data too
    admin.savedBooks = [books[2]._id, books[3]._id];
    admin.following = [writers[1]._id];
    await admin.save();

    console.log('Client Demo Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
