require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Book = require('./src/models/Book');

const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data for a fresh start with time-series data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Book.deleteMany({});

    // Superadmin Creation
    const adminEmail = 'superadmin@mozhibu.com';
    const rawPassword = 'mozhibu123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const admin = new User({
      username: 'Superadmin',
      email: adminEmail,
      mobile: '0000000000',
      preferredLanguage: 'English',
      favoriteGenres: ['All'],
      authProvider: 'normal',
      password: hashedPassword,
      role: 'superadmin',
      status: 'active',
      createdAt: new Date('2025-01-01')
    });
    await admin.save();
    console.log('Superadmin created successfully.');

    // Seed Random Users over the past 12 months
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    console.log('Seeding random users over the past 12 months...');
    for (let i = 0; i < 50; i++) {
      await User.create({
        username: `User${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        role: i % 5 === 0 ? 'writer' : 'reader',
        mobile: '1234567890',
        preferredLanguage: 'English',
        createdAt: getRandomDate(oneYearAgo, now)
      });
    }

    // Seed Mock Books over the past 12 months
    console.log('Seeding mock books...');
    const titles = ['The Echoes of Eternity', 'Shadows of Tomorrow', 'Silence at Dawn', 'Light from the Deep', 'The Forgotten Path', 'Whispers in the Wind', 'Crimson Sky', 'The Last Horizon'];
    const covers = [
      'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=400',
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=400'
    ];
    
    for (let i = 0; i < 120; i++) {
      await Book.create({
        title: titles[i % titles.length] + (i > 7 ? ` Vol ${i}` : ''),
        author: admin._id,
        cover: covers[i % covers.length],
        genre: 'Fantasy',
        views: Math.floor(Math.random() * 50000),
        rating: 3.5 + (Math.random() * 1.5),
        isAudio: i % 3 === 0,
        status: i < 90 ? 'published' : 'pending',
        createdAt: getRandomDate(oneYearAgo, now)
      });
    }
    console.log('Time-series data seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
