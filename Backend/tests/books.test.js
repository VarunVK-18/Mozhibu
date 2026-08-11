const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const booksRouter = require('../src/routes/books');
const User = require('../src/models/User');
const Book = require('../src/models/Book');

// Setup mock express app
const app = express();
app.use(express.json());
app.use('/api/books', booksRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

describe('Books API', () => {
  let writerToken, readerToken;
  let writerUser, readerUser;

  beforeEach(async () => {
    // Create Writer User
    writerUser = await User.create({
      username: 'TestWriter',
      email: 'writer@test.com',
      password: 'password123',
      mobile: '1234567890',
      preferredLanguage: 'English',
      role: 'writer'
    });
    writerToken = jwt.sign({ user: { id: writerUser._id, role: 'writer' } }, JWT_SECRET);

    // Create Reader User
    readerUser = await User.create({
      username: 'TestReader',
      email: 'reader@test.com',
      password: 'password123',
      mobile: '0987654321',
      preferredLanguage: 'English',
      role: 'reader'
    });
    readerToken = jwt.sign({ user: { id: readerUser._id, role: 'reader' } }, JWT_SECRET);
  });

  describe('POST /api/books', () => {
    it('should allow a writer to create a book', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${writerToken}`)
        .send({
          title: 'A New Masterpiece',
          synopsis: 'This is a test book.',
          genre: 'Fantasy'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('A New Masterpiece');
      expect(res.body.author.toString()).toEqual(writerUser._id.toString());
    });

    it('should deny a reader from creating a book', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          title: 'Reader Tries to Write',
          synopsis: 'Should fail.',
          genre: 'Sci-Fi'
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.msg).toEqual('Forbidden, author only');
    });

    it('should deny unauthorized access', async () => {
      const res = await request(app)
        .post('/api/books')
        .send({
          title: 'No Token',
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
