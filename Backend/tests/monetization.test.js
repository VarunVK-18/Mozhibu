const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const server = require('../server');
const User = require('../src/models/User');
const AuthorEarnings = require('../src/models/AuthorEarnings');
const ReaderReward = require('../src/models/ReaderReward');
const RevenueSplitConfig = require('../src/models/RevenueSplitConfig');
const Notification = require('../src/models/Notification');
const crypto = require('crypto');

describe('Monetization Module Tests', () => {
  let readerToken, authorToken, superadminToken;
  let reader, author, superadmin;

  const generateToken = (id) => {
    return jwt.sign({ user: { id } }, process.env.JWT_SECRET || 'test_jwt_secret', { expiresIn: '1h' });
  };

  beforeEach(async () => {
    // We assume the DB memory server is already started by setup.js
    process.env.ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

    // Create config
    await RevenueSplitConfig.create({
      authorSharePercent: 50,
      mozhibuSharePercent: 50,
      minAuthorPayoutInPaise: 2600
    });

    // Create users
    reader = await User.create({
      username: 'testreader',
      email: 'reader@test.com',
      password: 'password123',
      role: 'reader',
      preferredLanguage: 'English',
      mobile: '1234567890'
    });

    author = await User.create({
      username: 'testauthor',
      email: 'author@test.com',
      password: 'password123',
      role: 'writer',
      preferredLanguage: 'English',
      mobile: '0987654321'
    });

    superadmin = await User.create({
      username: 'superadmin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'superadmin',
      preferredLanguage: 'English',
      mobile: '1122334455'
    });

    readerToken = generateToken(reader._id);
    authorToken = generateToken(author._id);
    superadminToken = generateToken(superadmin._id);
  });

  describe('1. Reader Rewards & Withdrawal', () => {
    it('Should correctly store reader bank details with encryption', async () => {
      const res = await request(server)
        .put('/api/users/me/monetization')
        .set('Authorization', `Bearer ${readerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          accountName: 'Reader Bank',
          bankName: 'Test Bank',
          accountNumber: '1234567890',
          ifscCode: 'TEST0001234'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Monetization details securely updated');

      const updatedReader = await User.findById(reader._id);
      expect(updatedReader.monetization).toBeDefined();
      expect(updatedReader.monetization.accountNumber).not.toBe('1234567890'); // Should be encrypted
    });

    it('Should allow reader to request withdrawal if balance >= 26 INR', async () => {
      // Add fake rewards
      await ReaderReward.create({
        user: reader._id,
        rewardInPaise: 3000, // 30 INR
        sourceActivity: 'daily_read',
        status: 'pending',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const res = await request(server)
        .post('/api/earnings/withdraw')
        .set('Authorization', `Bearer ${readerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Withdrawal of ₹30.00 requested successfully. Our team will process it shortly.');

      const updatedReward = await ReaderReward.findOne({ user: reader._id });
      expect(updatedReward.status).toBe('requested');
    });

    it('Should block withdrawal if balance < 26 INR', async () => {
      // Clear previous rewards
      await ReaderReward.deleteMany({});
      
      await ReaderReward.create({
        user: reader._id,
        rewardInPaise: 1000, // 10 INR
        sourceActivity: 'daily_read',
        status: 'pending',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      const res = await request(server)
        .post('/api/earnings/withdraw')
        .set('Authorization', `Bearer ${readerToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

    expect(res.statusCode).toBe(400);
    expect(res.body.msg).toBe('Your combined balance is ₹10.00. Minimum withdrawal amount is ₹26.00.');
    });
  });

  describe('2. Author Earnings & Withdrawal', () => {
    beforeEach(async () => {
      // Set up author bank details
      await request(server)
        .put('/api/users/me/monetization')
        .set('Authorization', `Bearer ${authorToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          accountName: 'Author Bank',
          bankName: 'Writer Bank',
          accountNumber: '0987654321',
          ifscCode: 'WRTR0001234'
        });
    });

    it('Should combine author and reader earnings for withdrawal calculation', async () => {
      // 10 INR from writing, 20 INR from reading = 30 INR total
      await AuthorEarnings.create({
        author: author._id,
        earningsInPaise: 1000,
        sourceType: 'royalties',
        status: 'pending',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      await ReaderReward.create({
        user: author._id, // Author reading books
        rewardInPaise: 2000,
        sourceActivity: 'daily_read',
        status: 'pending',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });

      // Check balance
      const balanceRes = await request(server)
        .get('/api/earnings/me')
        .set('Authorization', `Bearer ${authorToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');
      
      expect(balanceRes.statusCode).toBe(200);
      expect(balanceRes.body.summary.totalPendingInPaise).toBe(3000);

      // Request withdrawal
      const withdrawRes = await request(server)
        .post('/api/earnings/withdraw')
        .set('Authorization', `Bearer ${authorToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(withdrawRes.statusCode).toBe(200);
      expect(withdrawRes.body.msg).toBe('Withdrawal of ₹30.00 requested successfully. Our team will process it shortly.');

      // Both should be marked as requested
      const aEarnings = await AuthorEarnings.findOne({ author: author._id });
      const rReward = await ReaderReward.findOne({ user: author._id });
      expect(aEarnings.status).toBe('requested');
      expect(rReward.status).toBe('requested');
    });
  });

  describe('3. Superadmin Payouts Dashboard', () => {
    beforeEach(async () => {
      // Add author bank details
      await request(server)
        .put('/api/users/me/monetization')
        .set('Authorization', `Bearer ${authorToken}`)
        .set('X-Requested-With', 'XMLHttpRequest')
        .send({
          accountName: 'Author Bank',
          bankName: 'Writer Bank',
          accountNumber: '0987654321',
          ifscCode: 'WRTR0001234'
        });

      // Seed a requested payout
      await AuthorEarnings.create({
        author: author._id,
        earningsInPaise: 3000,
        sourceType: 'royalties',
        status: 'requested',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
    });

    it('Should fetch all grouped requested payouts and decrypt bank info', async () => {
      // We have Author requested (30 INR total) from previous test
      const res = await request(server)
        .get('/api/admin/payouts')
        .set('Authorization', `Bearer ${superadminToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
      
      const authorPayout = res.body.find(p => p.user.email === 'author@test.com');
      expect(authorPayout).toBeDefined();
      expect(authorPayout.totalRequestedInPaise).toBe(3000); // 1000 + 2000
      expect(authorPayout.user.bankDetails.accountNumber).toBe('0987654321'); // Decrypted
    });

    it('Should mark payout as paid and create notification', async () => {
      const res = await request(server)
        .post(`/api/admin/payouts/${author._id}/mark-paid`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .set('X-Requested-With', 'XMLHttpRequest');

      expect(res.statusCode).toBe(200);
      expect(res.body.msg).toBe('Payout marked as paid and user notified successfully');

      // Check database updates
      const aEarnings = await AuthorEarnings.findOne({ author: author._id });
      expect(aEarnings.status).toBe('paid');
      expect(aEarnings.paidBy.toString()).toBe(superadmin._id.toString());

      // Check Notification
      const notification = await Notification.findOne({ recipient: author._id });
      expect(notification).toBeDefined();
      expect(notification.type).toBe('system');
    });
  });
});
