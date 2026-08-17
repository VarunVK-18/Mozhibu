const express = require('express');
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const Chapter = require('../models/Chapter');
const Review = require('../models/Review');
const Report = require('../models/Report');
const UserSubscription = require('../models/UserSubscription');
const { protect, protectOptional, author } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { translateBooks, translateChapters } = require('../services/translationService');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/covers'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
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

// @route POST /api/books/cover
// @desc Upload a cover image and get its URL
router.post('/cover', protect, author, upload.single('cover'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }
  res.json({ coverUrl: `/uploads/covers/${req.file.filename}` });
});
const getGenAI = () => {
  const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenerativeAI(randomKey);
};

// @route GET /api/books/categories
// @desc Get all unique book genres with counts
router.get('/categories', async (req, res) => {
  try {
    const categories = await Book.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $project: { _id: 0, name: '$_id', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/me
// @desc Get all books written by the logged-in author
router.get('/me', protect, author, async (req, res) => {
  try {
    const books = await Book.find({ author: req.user.id }).sort({ createdAt: -1 }).lean();
    
    // Attach chapter count to each book
    const booksWithStats = await Promise.all(books.map(async (book) => {
      const chapterCount = await Chapter.countDocuments({ book: book._id });
      return { ...book, chapters: chapterCount };
    }));

    res.json(booksWithStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/books/:id/status
// @desc Toggle the completion status of a book
router.put('/:id/status', protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    
    if (book.author.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const { completionStatus } = req.body;
    if (completionStatus) {
      book.completionStatus = completionStatus;
      await book.save();
    }
    
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books
// @desc Get all published books
router.get('/', async (req, res) => {
  try {
    let query = { status: 'published' };
    
    // Search query
    if (req.query.q) {
      query.title = { $regex: req.query.q, $options: 'i' };
    }
    
    // Audio filter
    if (req.query.isAudio === 'true') {
      query.isAudio = true;
    }
    
    // Genre filter
    if (req.query.genre) {
      query.genre = req.query.genre;
    }
    
    // Sorting
    let sortObj = { createdAt: -1 }; // default to latest
    
    if (req.query.sort === 'trending') {
      // Sort by views + rating combined (approximate by sorting views descending then rating descending)
      sortObj = { views: -1, rating: -1 };
    } else if (req.query.sort === 'popular') {
      sortObj = { views: -1 };
    }
    
    const books = await Book.find(query)
      .populate('author', 'username avatar')
      .sort(sortObj)
      .limit(Number(req.query.limit) || 20); // Limit to 20 by default for speed
      
    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedBooks = await translateBooks(books, targetLang);
      
    res.json(translatedBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id
// @desc Get a single published book (or unpublished if requested by author)
router.get('/:id', protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author', 'username avatar');
    
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    
    const isAuthor = req.user && book.author && book.author._id.toString() === req.user.id;
    if (book.status !== 'published' && !isAuthor) {
      return res.status(404).json({ msg: 'Book not found or not published' });
    }

    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedBooks = await translateBooks([book], targetLang);

    res.json(translatedBooks[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/books/:id
// @desc Update an existing book
router.put('/:id', protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    
    // Check if user is author or superadmin
    if (book.author.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Not authorized to update this book' });
    }
    
    // Only allow updating certain fields to prevent abuse
    const updatableFields = ['title', 'genre', 'description', 'tags', 'series', 'cover', 'status', 'accessType'];
    const updateData = {};
    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }
    
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    
    res.json(updatedBook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id/chapters
// @desc Get all chapters for a book
router.get('/:id/chapters', protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    let isSubscriber = false;
    if (req.user) {
      const activeSub = await UserSubscription.findOne({
        user: req.user.id,
        status: 'active',
        endDate: { $gt: new Date() }
      });
      if (activeSub) {
        isSubscriber = true;
      }
    }

    const isAuthor = req.user && book.author && book.author.toString() === req.user.id;
    const query = { book: req.params.id };
    if (!isAuthor) {
      query.status = 'published';
    }

    const chapters = await Chapter.find(query).sort({ order: 1 });
      
    // Apply access control before returning
    const chaptersWithAccess = chapters.map(chapter => {
      const isPremium = chapter.accessType === 'premium' || (chapter.accessType === 'inherit' && book.accessType === 'premium');
      
      const chapObj = chapter.toObject();
      
      // Authors can always read their own chapters
      if (isAuthor) {
        chapObj.isLocked = false;
        return chapObj;
      }
      
      if (isPremium && !isSubscriber) {
        chapObj.content = null;
        chapObj.isLocked = true;
      } else {
        chapObj.isLocked = false;
      }
      return chapObj;
    });
      
    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedChapters = await translateChapters(chaptersWithAccess, targetLang);

    res.json(translatedChapters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id/reviews
// @desc Get all approved reviews for a book
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.id, status: 'approved', parentReview: { $exists: false } })
      .populate('user', 'username avatar')
      .populate({
        path: 'replies',
        populate: { path: 'user', select: 'username avatar' }
      })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/reviews
// @desc Post a review for a book
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    // Allow multiple comments per user (removed existingReview check)

    const newReview = new Review({
      book: req.params.id,
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.content,
      status: 'approved' // Automatically approve for now, can be changed to pending
    });

    const review = await newReview.save();
    
    // Update book rating
    const reviews = await Review.find({ book: req.params.id, status: 'approved' });
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
    book.rating = avgRating;
    await book.save();

    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/like
// @desc Like a comment
router.post('/:id/reviews/:reviewId/like', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    const userId = req.user.id;
    // Remove from dislikes if present
    review.dislikes = review.dislikes.filter(id => id.toString() !== userId);
    
    // Toggle like
    const index = review.likes.findIndex(id => id.toString() === userId);
    if (index > -1) {
      review.likes.splice(index, 1); // unlike
    } else {
      review.likes.push(userId); // like
    }
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/dislike
// @desc Dislike a comment
router.post('/:id/reviews/:reviewId/dislike', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ msg: 'Review not found' });

    const userId = req.user.id;
    // Remove from likes if present
    review.likes = review.likes.filter(id => id.toString() !== userId);
    
    // Toggle dislike
    const index = review.dislikes.findIndex(id => id.toString() === userId);
    if (index > -1) {
      review.dislikes.splice(index, 1); // undislike
    } else {
      review.dislikes.push(userId); // dislike
    }
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/reviews/:reviewId/reply
// @desc Reply to a comment
router.post('/:id/reviews/:reviewId/reply', protect, async (req, res) => {
  try {
    const parentReview = await Review.findById(req.params.reviewId);
    if (!parentReview) return res.status(404).json({ msg: 'Parent review not found' });

    const newReply = new Review({
      book: req.params.id,
      user: req.user.id,
      comment: req.body.content,
      parentReview: parentReview._id,
      status: 'approved'
    });

    const reply = await newReply.save();
    
    // Add to parent replies
    parentReview.replies.push(reply._id);
    await parentReview.save();

    // Populate user before sending back
    await reply.populate('user', 'username avatar');
    res.json(reply);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/like
// @desc Toggle like for a book
router.post('/:id/like', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    if (!book.likes) {
      book.likes = [];
    }

    const isLiked = book.likes.some(id => id.toString() === req.user.id);

    if (isLiked) {
      // Unlike
      book.likes = book.likes.filter(id => id.toString() !== req.user.id);
    } else {
      // Like
      book.likes.push(req.user.id);
    }
    
    book.likesCount = book.likes.length;
    await book.save();
    
    res.json({ msg: isLiked ? 'Unliked' : 'Liked', isLiked: !isLiked, likesCount: book.likesCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/report
// @desc Report a book
router.post('/:id/report', protect, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });

    const newReport = new Report({
      book: req.params.id,
      reporter: req.user.id,
      reason: req.body.reason || 'Other'
    });

    await newReport.save();

    book.reportCount = (book.reportCount || 0) + 1;
    if (book.reportCount >= 50) {
      book.status = 'suspended';
    }
    await book.save();

    res.json({ msg: 'Report submitted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books
// @desc Create a new book
router.post('/', protect, author, async (req, res) => {
  try {
    const newBook = new Book({
      ...req.body,
      author: req.user.id
    });
    const book = await newBook.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/:id/chapters
// @desc Create a new chapter for a book
router.post('/:id/chapters', protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.author.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    // Automatically calculate order
    const lastChapter = await Chapter.findOne({ book: req.params.id }).sort('-order');
    const nextOrder = lastChapter ? lastChapter.order + 1 : 1;
    
    const newChapter = new Chapter({
      ...req.body,
      order: nextOrder,
      book: req.params.id
    });
    const chapter = await newChapter.save();
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id/chapters/:chapterId
// @desc Get a single chapter
router.get('/:id/chapters/:chapterId', protectOptional, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    
    const chapter = await Chapter.findOne({ _id: req.params.chapterId, book: req.params.id });
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    
    const isAuthor = req.user && book.author.toString() === req.user.id;
    
    // Determine if premium
    const isPremium = chapter.accessType === 'premium' || (chapter.accessType === 'inherit' && book.accessType === 'premium');
    
    if (isPremium && !isAuthor) {
      let isSubscriber = false;
      if (req.user) {
        const activeSub = await UserSubscription.findOne({
          user: req.user.id,
          status: 'active',
          endDate: { $gt: new Date() }
        });
        if (activeSub) isSubscriber = true;
      }
      if (!isSubscriber) {
        return res.status(403).json({ msg: 'Premium chapter. Subscription required.' });
      }
    }

    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route PUT /api/books/:id/chapters/:chapterId
// @desc Update a chapter
router.put('/:id/chapters/:chapterId', protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.author.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const chapter = await Chapter.findOneAndUpdate(
      { _id: req.params.chapterId, book: req.params.id },
      { $set: req.body },
      { new: true }
    );
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    
    res.json(chapter);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route DELETE /api/books/:id/chapters/:chapterId
// @desc Delete a chapter
router.delete('/:id/chapters/:chapterId', protect, author, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ msg: 'Book not found' });
    if (book.author.toString() !== req.user.id && req.user.role !== 'superadmin') {
      return res.status(403).json({ msg: 'Not authorized' });
    }
    
    const chapter = await Chapter.findOneAndDelete({ _id: req.params.chapterId, book: req.params.id });
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });
    
    res.json({ msg: 'Chapter deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route POST /api/books/translate-html
// @desc Translate raw HTML to target language (for UI demo)
router.post('/translate-html', async (req, res) => {
  const { html, targetLang } = req.body;
  if (!html || !targetLang) return res.status(400).json({ msg: 'html and targetLang required' });

  const langMap = {
    'en': 'English', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam',
    'kn': 'Kannada', 'bn': 'Bengali', 'hi': 'Hindi', 'pa': 'Punjabi',
    'mr': 'Marathi', 'ur': 'Urdu', 'gu': 'Gujarati', 'or': 'Odia'
  };
  const targetLangName = langMap[targetLang] || targetLang;

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `Translate the following HTML story content into ${targetLangName}. 
Only return the translated HTML. Preserve all HTML tags and structure exactly as they are. 
Do not add markdown blocks like \`\`\`html. 
Content to translate:

${html}`;

    const result = await model.generateContent(prompt);
    let translatedContent = result.response.text();
    if (translatedContent.startsWith('\`\`\`html')) {
        translatedContent = translatedContent.replace(/\`\`\`html\n?/, '').replace(/\`\`\`\n?$/, '');
    } else if (translatedContent.startsWith('\`\`\`')) {
        translatedContent = translatedContent.replace(/\`\`\`\n?/, '').replace(/\`\`\`\n?$/, '');
    }
    translatedContent = translatedContent.trim();
    res.json({ content: translatedContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error', error: err.message || err.toString() });
  }
});

// @route POST /api/books/:id/chapters/:chapterId/translate
// @desc Translate a chapter to a target language using Gemini
router.post('/:id/chapters/:chapterId/translate', async (req, res) => {
  try {
    const { targetLang } = req.body;
    if (!targetLang) return res.status(400).json({ msg: 'targetLang is required' });

    const chapter = await Chapter.findById(req.params.chapterId);
    if (!chapter) return res.status(404).json({ msg: 'Chapter not found' });

    // Check if we already have the translation
    if (chapter.translations && chapter.translations.has(targetLang)) {
      return res.json({ content: chapter.translations.get(targetLang) });
    }

    // Initialize Gemini
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    // Create language map to give Gemini more context
    const langMap = {
      'en': 'English', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam',
      'kn': 'Kannada', 'bn': 'Bengali', 'hi': 'Hindi', 'pa': 'Punjabi',
      'mr': 'Marathi', 'ur': 'Urdu', 'gu': 'Gujarati', 'or': 'Odia'
    };
    const targetLangName = langMap[targetLang] || targetLang;

    const prompt = `Translate the following HTML story content into ${targetLangName}. 
Only return the translated HTML. Preserve all HTML tags and structure exactly as they are. 
Do not add markdown blocks like \`\`\`html. 
Content to translate:

${chapter.content}`;

    const result = await model.generateContent(prompt);
    let translatedContent = result.response.text();
    
    // Clean up potential markdown formatting from Gemini
    if (translatedContent.startsWith('\`\`\`html')) {
        translatedContent = translatedContent.replace(/\`\`\`html\n?/, '').replace(/\`\`\`\n?$/, '');
    } else if (translatedContent.startsWith('\`\`\`')) {
        translatedContent = translatedContent.replace(/\`\`\`\n?/, '').replace(/\`\`\`\n?$/, '');
    }
    translatedContent = translatedContent.trim();

    // Save translation
    if (!chapter.translations) chapter.translations = new Map();
    chapter.translations.set(targetLang, translatedContent);
    await chapter.save();

    res.json({ content: translatedContent });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
