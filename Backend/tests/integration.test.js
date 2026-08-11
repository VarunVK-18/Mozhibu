const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server'); // We need to export app from server.js for supertest!

// Since server.js might not export app, we will just test the routes directly if needed,
// but let's assume we can mock or start a quick express server.
const express = require('express');
const booksRoute = require('../src/routes/books');
const usersRoute = require('../src/routes/users');
const Book = require('../src/models/Book');
const User = require('../src/models/User');
const Chapter = require('../src/models/Chapter');

const testApp = express();
testApp.use(express.json());
testApp.use('/api/books', booksRoute);
testApp.use('/api/users', usersRoute);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.disconnect(); // Disconnect from any existing connection
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Integration Tests: Books & Users API', () => {
  let user, book1, book2, chapter;
  
  beforeEach(async () => {
    await Book.deleteMany({});
    await User.deleteMany({});
    await Chapter.deleteMany({});

    user = await User.create({
      username: 'TestAuthor',
      email: 'author@test.com',
      password: 'password123',
      role: 'writer',
      followersCount: 1500,
      mobile: '1234567890',
      preferredLanguage: 'English'
    });

    book1 = await Book.create({
      title: 'Trending Book',
      author: user._id,
      genre: 'Fantasy',
      views: 10000,
      rating: 4.8,
      status: 'published'
    });

    book2 = await Book.create({
      title: 'Audio Book',
      author: user._id,
      genre: 'Romance',
      isAudio: true,
      views: 500,
      rating: 3.5,
      status: 'published'
    });

    chapter = await Chapter.create({
      book: book1._id,
      title: 'Chapter 1',
      content: 'Hello World',
      order: 1,
      status: 'published'
    });
  });

  test('GET /api/books?sort=trending returns books sorted by views and rating', async () => {
    const res = await request(testApp).get('/api/books?sort=trending');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].title).toBe('Trending Book');
  });

  test('GET /api/books?isAudio=true returns only audio books', async () => {
    const res = await request(testApp).get('/api/books?isAudio=true');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Audio Book');
  });

  test('GET /api/books/categories returns unique categories', async () => {
    const res = await request(testApp).get('/api/books/categories');
    expect(res.status).toBe(200);
    expect(res.body).toContain('Fantasy');
    expect(res.body).toContain('Romance');
    expect(res.body.length).toBe(2);
  });

  test('GET /api/books/:id/chapters returns chapters for a book', async () => {
    const res = await request(testApp).get(`/api/books/${book1._id}/chapters`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toBe('Chapter 1');
  });
});
