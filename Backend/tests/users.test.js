const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const usersRouter = require('../src/routes/users');
const User = require('../src/models/User');

// Setup mock express app
const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

describe('Users API', () => {
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
      role: 'writer',
      followersCount: 10
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

  describe('GET /api/users/authors', () => {
    it('should return all users with role writer or superadmin', async () => {
      const res = await request(app).get('/api/users/authors');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(1);
      expect(res.body[0].username).toEqual('TestWriter');
    });
  });

  describe('POST /api/users/follow/:authorId', () => {
    it('should allow a reader to follow an author', async () => {
      const res = await request(app)
        .post(`/api/users/follow/${writerUser._id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Followed successfully');
      expect(res.body.following).toEqual(true);

      const updatedWriter = await User.findById(writerUser._id);
      expect(updatedWriter.followersCount).toEqual(11);
    });

    it('should allow a reader to unfollow an author they are already following', async () => {
      // First follow
      await request(app)
        .post(`/api/users/follow/${writerUser._id}`)
        .set('Authorization', `Bearer ${readerToken}`);
      
      // Then unfollow
      const res = await request(app)
        .post(`/api/users/follow/${writerUser._id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Unfollowed successfully');
      expect(res.body.following).toEqual(false);
      
      const updatedWriter = await User.findById(writerUser._id);
      expect(updatedWriter.followersCount).toEqual(10); // Back to 10
    });

    it('should not allow following a reader', async () => {
      const res = await request(app)
        .post(`/api/users/follow/${readerUser._id}`)
        .set('Authorization', `Bearer ${writerToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Can only follow authors');
    });
  });

  describe('POST /api/users/me/avatar', () => {
    it('should successfully upload an avatar image', async () => {
      // Create a valid 1x1 PNG dummy file buffer to upload
      const dummyFile = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
      
      const res = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${readerToken}`)
        .attach('avatar', dummyFile, 'test-avatar.png');

      expect(res.statusCode).toEqual(200);
      expect(res.body.msg).toEqual('Avatar uploaded successfully');
      expect(res.body.avatar).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should return 400 if no file is provided', async () => {
      const res = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${readerToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('No file uploaded');
    });
  });
});
