const express = require('express');
const Book = require('../models/Book');

const router = express.Router();

// @route GET /api/books
// @desc Get all published books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find({ status: 'published' })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route GET /api/books/:id
// @desc Get a single published book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, status: 'published' })
      .populate('author', 'username');
    if (!book) return res.status(404).json({ msg: 'Book not found or not published' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
