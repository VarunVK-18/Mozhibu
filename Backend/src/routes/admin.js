const express = require('express');
const { protect, superadmin } = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const Notification = require('../models/Notification');

const router = express.Router();

// All routes here are protected and require superadmin
router.use(protect);
router.use(superadmin);

// @route GET /api/admin/stats
// @desc Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const totalPublishedBooks = await Book.countDocuments({ status: 'published' });
    const totalReaders = await User.countDocuments({ role: 'reader' });
    const totalWriters = await User.countDocuments({ role: 'writer' });
    const pendingBooks = await Book.countDocuments({ status: 'pending' });
    const totalAuthors = await User.countDocuments({ role: { $in: ['writer', 'superadmin'] } });

    // Time-series aggregations for the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const booksAggregation = await Book.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const usersAggregation = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, count: { $sum: 1 } } }
    ]);

    const format12Months = (aggData) => {
      const data = new Array(12).fill(0);
      const labels = new Array(12).fill('');
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels[11 - i] = d.toLocaleString('default', { month: 'short' });
        const found = aggData.find(item => item._id.month === d.getMonth() + 1 && item._id.year === d.getFullYear());
        if (found) data[11 - i] = found.count;
      }
      return { data, labels };
    };

    const monthlyBooks = format12Months(booksAggregation);
    const monthlyUsers = format12Months(usersAggregation);

    res.json({
      totalPublishedBooks,
      totalUsers: totalReaders + totalWriters,
      readers: totalReaders,
      writers: totalWriters,
      totalAuthors,
      pendingBooks,
      monthlyBooksData: monthlyBooks.data,
      monthlyUsersData: monthlyUsers.data,
      chartLabels: monthlyBooks.labels
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/books
// @desc Get all books with optional status filter
router.get('/books', async (req, res) => {
  try {
    const status = req.query.status;
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    const books = await Book.find(query).populate('author', 'username email').sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/books/:id
// @desc Get book details
router.get('/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author', 'username email');
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/admin/books/:id/status
// @desc Update book status (approve/reject)
router.put('/books/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['pending', 'published', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    book.status = status;
    if (status === 'rejected') {
      book.rejectionReason = rejectionReason || 'No reason provided';
    }
    if (status === 'published') {
      book.rejectionReason = undefined;
    }
    book.reviewedAt = Date.now();
    book.reviewedBy = req.user.id;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/users
// @desc Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/admin/users/:id/status
// @desc Suspend or reactivate user
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.status = status;
    await user.save();
    res.json({ id: user.id, status: user.status });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/authors
// @desc Get authors with their published book count
router.get('/authors', async (req, res) => {
  try {
    const authors = await User.find({ role: { $in: ['writer', 'superadmin'] } }).select('username email createdAt status');
    
    // In a real production app, use MongoDB aggregation for performance
    const authorStats = await Promise.all(authors.map(async (author) => {
      const publishedCount = await Book.countDocuments({ author: author._id, status: 'published' });
      // Total reads is tricky if views are not tracked accurately, we sum up views of books
      const authorBooks = await Book.find({ author: author._id, status: 'published' });
      const totalReads = authorBooks.reduce((sum, book) => sum + book.views, 0);
      
      return {
        _id: author._id,
        username: author.username,
        email: author.email,
        status: author.status,
        joinedAt: author.createdAt,
        publishedCount,
        totalReads
      };
    }));

    res.json(authorStats);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/authors/:id
// @desc Get author profile details and their books
router.get('/authors/:id', async (req, res) => {
  try {
    const author = await User.findById(req.params.id).select('-password');
    if (!author) return res.status(404).json({ msg: 'Author not found' });

    const books = await Book.find({ author: req.params.id }).sort({ createdAt: -1 });

    res.json({
      author,
      books
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/admin/pending-authors
// @desc Get users requesting author status
router.get('/pending-authors', async (req, res) => {
  try {
    const pendingAuthors = await User.find({ authorStatus: 'pending' }).select('username email createdAt status authorStatus');
    res.json(pendingAuthors);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/admin/pending-authors/:id/status
// @desc Approve or reject an author request
router.put('/pending-authors/:id/status', async (req, res) => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ msg: 'Invalid action. Use approve or reject.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user.authorStatus !== 'pending') return res.status(400).json({ msg: 'User is not pending approval' });

    if (action === 'approve') {
      user.role = 'writer';
      user.authorStatus = 'approved';
    } else {
      user.authorStatus = 'rejected';
    }

    await user.save();
    res.json({ id: user.id, role: user.role, authorStatus: user.authorStatus });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/admin/broadcast
// @desc Broadcast announcement to users
router.post('/broadcast', async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    
    if (!title || !message || !audience) {
      return res.status(400).json({ msg: 'Please provide title, message, and audience' });
    }

    let query = {};
    if (audience === 'readers') {
      query.role = 'reader';
    } else if (audience === 'writers') {
      query.role = { $in: ['writer', 'superadmin'] };
    }

    const users = await User.find(query).select('_id');
    
    if (users.length === 0) {
      return res.status(400).json({ msg: 'No users found for this audience' });
    }

    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'announcement',
      title: title,
      message: message,
      isRead: false
    }));

    await Notification.insertMany(notifications);

    const io = req.app.get('io');
    const userSockets = req.app.get('userSockets');
    
    if (io && userSockets) {
      users.forEach(user => {
        const socketId = userSockets.get(user._id.toString());
        if (socketId) {
          io.to(socketId).emit('incoming_notification');
        }
      });
    }

    res.json({ msg: `Announcement sent successfully to ${users.length} users.` });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
