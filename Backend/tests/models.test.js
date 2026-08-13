const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Models
const User = require('../src/models/User');
const Book = require('../src/models/Book');
const Chapter = require('../src/models/Chapter');
const Review = require('../src/models/Review');
const ReadingProgress = require('../src/models/ReadingProgress');
const AuthorRequest = require('../src/models/AuthorRequest');
const PublicationRequest = require('../src/models/PublicationRequest');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.disconnect(); // Ensure no active connection
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

describe('Database Models Unit Tests', () => {
  let user, book;

  beforeEach(async () => {
    user = await User.create({
      username: 'TestUser',
      email: 'test@example.com',
      mobile: '1234567890',
      preferredLanguage: 'English',
      favoriteGenres: ['Fantasy']
    });

    book = await Book.create({
      title: 'Test Book',
      author: user._id,
      genre: 'Fantasy'
    });
  });

  test('Should create a Chapter successfully', async () => {
    const chapter = await Chapter.create({
      book: book._id,
      title: 'Chapter 1',
      content: 'Once upon a time...',
      order: 1
    });
    expect(chapter.title).toBe('Chapter 1');
    expect(chapter.status).toBe('draft');
  });

  test('Should create an AuthorRequest successfully', async () => {
    const req = await AuthorRequest.create({ user: user._id });
    expect(req.status).toBe('pending');
    expect(req.user.toString()).toBe(user._id.toString());
  });

  test('Should create a PublicationRequest successfully', async () => {
    const req = await PublicationRequest.create({ book: book._id, author: user._id });
    expect(req.status).toBe('pending');
    expect(req.book.toString()).toBe(book._id.toString());
  });

  test('Should create a Review successfully', async () => {
    const review = await Review.create({
      user: user._id,
      book: book._id,
      rating: 5,
      comment: 'Great book!'
    });
    expect(review.rating).toBe(5);
    expect(review.status).toBe('pending');
  });

  test('Should create ReadingProgress successfully', async () => {
    const progress = await ReadingProgress.create({
      user: user._id,
      book: book._id,
      progressPercentage: 50
    });
    expect(progress.progressPercentage).toBe(50);
  });
});
