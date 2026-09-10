const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const usersRouter = require('../src/routes/users');
const authRouter = require('../src/routes/auth');
const User = require('../src/models/User');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

const JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

describe('Pen Name Sync', () => {
  let user, token;

  beforeEach(async () => {
    user = await User.create({
      username: 'OriginalUser123',
      email: 'original@test.com',
      password: 'password123',
      mobile: '1234567890',
      role: 'reader',
      preferredLanguage: 'English'
    });
    token = jwt.sign({ user: { id: user._id, role: 'reader' } }, JWT_SECRET);
  });

  it('should update username when penName is updated via PUT /api/users/me/profile', async () => {
    const res = await request(app)
      .put('/api/users/me/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ penName: 'NewPenName456' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.penName).toEqual('NewPenName456');
    expect(res.body.user.username).toEqual('NewPenName456');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.penName).toEqual('NewPenName456');
    expect(updatedUser.username).toEqual('NewPenName456');
  });

  it('should update username when penName is updated via POST /api/auth/onboard', async () => {
    const res = await request(app)
      .post('/api/auth/onboard')
      .set('Authorization', `Bearer ${token}`)
      .send({ penName: 'OnboardPenName789' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.penName).toEqual('OnboardPenName789');
    expect(res.body.user.username).toEqual('OnboardPenName789');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.penName).toEqual('OnboardPenName789');
    expect(updatedUser.username).toEqual('OnboardPenName789');
  });
});
