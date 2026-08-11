const express = require('express');
const Book = require('../models/Book');
const Chapter = require('../models/Chapter');
const Review = require('../models/Review');
const { protect, author } = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { translateBooks, translateChapters } = require('../services/translationService');

const router = express.Router();
const getGenAI = () => {
  const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return new GoogleGenerativeAI(randomKey);
};

// @route GET /api/books/categories
// @desc Get all unique book genres
router.get('/categories', async (req, res) => {
  try {
    const categories = await Book.distinct('genre', { status: 'published' });
    res.json(categories);
  } catch (err) {
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
// @desc Get a single published book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, status: 'published' })
      .populate('author', 'username avatar');
    if (!book) return res.status(404).json({ msg: 'Book not found or not published' });

    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedBooks = await translateBooks([book], targetLang);

    res.json(translatedBooks[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id/chapters
// @desc Get all chapters for a book
router.get('/:id/chapters', async (req, res) => {
  try {
    const chapters = await Chapter.find({ book: req.params.id, status: 'published' })
      .sort({ order: 1 });
      
    const targetLang = req.headers['x-app-language'] || 'en';
    const translatedChapters = await translateChapters(chapters, targetLang);

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
    const reviews = await Review.find({ book: req.params.id, status: 'approved' })
      .populate('user', 'username avatar')
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

    // Check if user already reviewed
    const existingReview = await Review.findOne({ book: req.params.id, user: req.user.id });
    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this book' });
    }

    const newReview = new Review({
      book: req.params.id,
      user: req.user.id,
      rating: req.body.rating,
      content: req.body.content,
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
    
    const newChapter = new Chapter({
      ...req.body,
      book: req.params.id
    });
    const chapter = await newChapter.save();
    res.json(chapter);
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
