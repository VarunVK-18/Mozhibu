const express = require('express');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const User = require('../models/User');
const Book = require('../models/Book');
const ReadingProgress = require('../models/ReadingProgress');
const { translateBooks } = require('../services/translationService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Configure Multer for Avatar Uploads (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// @route PUT /api/users/upgrade-role
// @desc Upgrade a reader to a writer
router.put('/upgrade-role', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'writer' || user.role === 'superadmin') {
      return res.status(400).json({ msg: 'User is already an author or admin' });
    }
    
    if (user.authorStatus === 'pending') {
      return res.status(400).json({ msg: 'Author request is already pending' });
    }

    user.authorStatus = 'pending';
    await user.save();

    // Issue a new token with the updated authorStatus
    const payload = { user: { id: user.id, role: user.role } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, user: { id: user.id, username: user.username, email: user.email, mobile: user.mobile, role: user.role, authorStatus: user.authorStatus } });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/me/library
// @desc Get current user's saved books
router.get('/me/library', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedBooks',
      populate: { path: 'author', select: 'username avatar' }
    });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    
    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedBooks = await translateBooks(user.savedBooks, targetLang);
    
    res.json(translatedBooks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/users/me/bookmarks/:bookId
// @desc Toggle bookmark status for a book
router.post('/me/bookmarks/:bookId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const book = await Book.findById(req.params.bookId);

    if (!user || !book) {
      return res.status(404).json({ msg: 'User or Book not found' });
    }

    const isBookmarked = user.savedBooks.some(id => id.toString() === req.params.bookId);

    if (isBookmarked) {
      // Remove bookmark
      user.savedBooks = user.savedBooks.filter(id => id.toString() !== req.params.bookId);
      await user.save();
      res.json({ msg: 'Bookmark removed', isBookmarked: false });
    } else {
      // Add bookmark
      user.savedBooks.push(req.params.bookId);
      await user.save();
      res.json({ msg: 'Bookmarked successfully', isBookmarked: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/me/following
// @desc Get current user's followed authors
router.get('/me/following', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('following', 'username avatar followersCount');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/me/followers
// @desc Get current user's followers
router.get('/me/followers', protect, async (req, res) => {
  try {
    const followers = await User.find({ following: req.user.id })
      .select('username avatar followersCount');
    res.json(followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/authors
// @desc Get all platform authors
router.get('/authors', async (req, res) => {
  try {
    const authors = await User.find({ role: { $in: ['writer', 'superadmin'] }, status: 'active' })
      .select('username avatar followersCount bio role')
      .sort({ followersCount: -1 });
    res.json(authors);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/author/:id
// @desc Get author profile and their published books
router.get('/author/:id', async (req, res) => {
  try {
    const author = await User.findOne({ 
      _id: req.params.id, 
      role: { $in: ['writer', 'superadmin'] },
      status: 'active'
    }).select('username avatar followersCount bio role createdAt');

    if (!author) {
      return res.status(404).json({ msg: 'Author not found' });
    }

    const books = await Book.find({ author: req.params.id, status: 'published' })
      .sort({ createdAt: -1 });

    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedBooks = await translateBooks(books, targetLang);

    res.json({ author, books: translatedBooks });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/users/follow/:authorId
// @desc Follow or unfollow an author
router.post('/follow/:authorId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const authorToFollow = await User.findById(req.params.authorId);

    if (!user || !authorToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (authorToFollow.role !== 'writer' && authorToFollow.role !== 'superadmin') {
      return res.status(400).json({ msg: 'Can only follow authors' });
    }

    if (req.user.id === req.params.authorId) {
      return res.status(400).json({ msg: 'Cannot follow yourself' });
    }

    const isFollowing = user.following.some(id => id.toString() === req.params.authorId);

    if (isFollowing) {
      // Unfollow
      user.following = user.following.filter(id => id.toString() !== req.params.authorId);
      authorToFollow.followersCount = Math.max(0, authorToFollow.followersCount - 1);
      await user.save();
      await authorToFollow.save();
      res.json({ msg: 'Unfollowed successfully', following: false });
    } else {
      // Follow
      if (!user.following.some(id => id.toString() === req.params.authorId)) {
        user.following.push(req.params.authorId);
      }
      authorToFollow.followersCount += 1;
      await user.save();
      await authorToFollow.save();

      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: authorToFollow._id,
        sender: user._id,
        type: 'follower',
        title: 'New Follower',
        message: `${user.username} started following you.`,
        link: `/profile/${user._id}`
      });

      res.json({ msg: 'Followed successfully', following: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/me/progress
// @desc Get current user's reading progress
router.get('/me/progress', protect, async (req, res) => {
  try {
    const progress = await ReadingProgress.find({ user: req.user.id })
      .populate('book', 'title cover chapters genre')
      .sort({ lastReadAt: -1 });
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/users/me/progress
// @desc Create or update reading progress
router.post('/me/progress', protect, async (req, res) => {
  try {
    const { bookId, chapterId, progressPercentage } = req.body;

    if (!bookId) {
      return res.status(400).json({ msg: 'Book ID is required' });
    }

    let progress = await ReadingProgress.findOne({ user: req.user.id, book: bookId });

    if (progress) {
      // Update existing
      if (chapterId) progress.currentChapter = chapterId;
      if (progressPercentage !== undefined) progress.progressPercentage = progressPercentage;
      progress.lastReadAt = Date.now();
      await progress.save();
    } else {
      // Create new
      progress = new ReadingProgress({
        user: req.user.id,
        book: bookId,
        currentChapter: chapterId,
        progressPercentage: progressPercentage || 0
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/users/me/progress
// @desc Get reading progress for user
router.get('/me/progress', protect, async (req, res) => {
  try {
    const progress = await ReadingProgress.find({ user: req.user.id })
      .populate('book', 'title cover author')
      .populate('currentChapter', 'title order')
      .sort({ lastReadAt: -1 });

    const targetLang = req.headers['x-app-language'] || 'en';
    
    // We only need to translate the populated book titles here
    const booksToTranslate = progress.map(p => p.book).filter(b => b);
    await translateBooks(booksToTranslate, targetLang);
    
    // Convert to plain objects if they aren't, to ensure modified subdocs are serialized correctly
    // or rely on the previous object manipulation
    
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/users/me/progress
// @desc Update reading progress for a book
router.post('/me/progress', protect, async (req, res) => {
  try {
    const { bookId, chapterId, progressPercentage } = req.body;
    let progress = await ReadingProgress.findOne({ user: req.user.id, book: bookId });

    if (progress) {
      if (chapterId) progress.currentChapter = chapterId;
      if (progressPercentage !== undefined) progress.progressPercentage = progressPercentage;
      progress.lastReadAt = Date.now();
      await progress.save();
    } else {
      progress = await ReadingProgress.create({
        user: req.user.id,
        book: bookId,
        currentChapter: chapterId,
        progressPercentage: progressPercentage || 0
      });
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/users/me/avatar
// @desc Upload a user avatar
router.post('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Compress the image and convert to base64
    const buffer = await sharp(req.file.buffer)
      .resize(256, 256, { fit: 'cover' }) // Avatars are small
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const avatarUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    
    user.avatar = avatarUrl;
    await user.save();

    // Issue a new token just in case we are embedding avatar in token in future
    res.json({
      msg: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/users/me/profile
// @desc Update user profile (bio)
router.put('/me/profile', protect, async (req, res) => {
  try {
    const { bio } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }
    if (req.body.avatar === null || req.body.avatar === '') {
      user.avatar = '';
    }

    await user.save();

    res.json({
      msg: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/users/me/deactivate
// @desc Deactivate user's own account
router.put('/me/deactivate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.status = 'deactivated';
    await user.save();

    res.json({ msg: 'Account deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route DELETE /api/users/me
// @desc Delete user's own account permanently
router.delete('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Find and delete all books of the user
    const books = await Book.find({ author: userId });
    const bookIds = books.map(b => b._id);
    
    // Delete chapters
    const Chapter = require('../models/Chapter');
    await Chapter.deleteMany({ book: { $in: bookIds } });
    
    // Delete reviews on author's books or written by user
    const Review = require('../models/Review');
    await Review.deleteMany({ book: { $in: bookIds } });
    await Review.deleteMany({ user: userId });
    
    // Delete reading progress
    await ReadingProgress.deleteMany({ $or: [{ user: userId }, { book: { $in: bookIds } }] });

    // Delete books
    await Book.deleteMany({ author: userId });

    // Remove user from other users' following arrays
    await User.updateMany({}, { $pull: { following: userId } });

    // Delete the user itself
    await User.findByIdAndDelete(userId);

    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
