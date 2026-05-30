const mongoose = require('mongoose');
const Book = require('../models/Book');

class BookController {
  /**
   * @route   GET /api/books
   * @desc    Get all books (with pagination, filters, and searches)
   * @access  Public
   */
  async index(req, res, next) {
    try {
      const filters = {};

      // 1. Genre filter
      if (req.query.genre && req.query.genre.trim() !== '') {
        filters.genre = req.query.genre;
      }

      // 2. Text Search (title or author)
      if (req.query.search && req.query.search.trim() !== '') {
        const searchRegex = new RegExp(req.query.search, 'i');
        filters.$or = [
          { title: searchRegex },
          { author: searchRegex }
        ];
      }

      // 3. Featured check
      if (req.query.featured === 'true' || req.query.featured === '1') {
        filters.is_featured = true;
      }

      // 4. Deals check
      if (req.query.deals === 'true' || req.query.deals === '1') {
        filters.is_deal = true;
      }

      // Pagination details
      const page = parseInt(req.query.page, 10) || 1;
      const perPageInput = req.query.per_page;
      
      // If perPage is 'all' or -1, return all results
      if (perPageInput === 'all' || parseInt(perPageInput, 10) === -1) {
        const books = await Book.find(filters).sort({ createdAt: -1 });
        return res.json({ data: books });
      }

      const perPage = parseInt(perPageInput, 10) || 12;
      const total = await Book.countDocuments(filters);
      const lastPage = Math.ceil(total / perPage) || 1;
      const offset = (page - 1) * perPage;

      const books = await Book.find(filters)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(perPage);

      // Construct a response mirroring Laravel's length-aware pagination schema exactly
      return res.json({
        data: books,
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: total,
        from: total === 0 ? null : offset + 1,
        to: total === 0 ? null : Math.min(offset + perPage, total)
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/books/:id
   * @desc    Get details of a single book
   * @access  Public
   */
  async show(req, res, next) {
    try {
      const bookId = Number(req.params.id);
      if (isNaN(bookId)) {
        return res.status(404).json({ message: 'Book not found' });
      }
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      return res.json(book);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/books
   * @desc    Create a new book (Admin only)
   * @access  Private/Admin
   */
  async store(req, res, next) {
    try {
      const {
        title,
        author,
        price,
        genre,
        stock,
        cover_image,
        description,
        is_featured,
        is_deal,
        isbn,
        pages,
        publisher,
        original_price
      } = req.body;

      if (!title || !author || price === undefined || !genre) {
        return res.status(400).json({ message: 'Title, author, price, and genre are required' });
      }

      // Automatically determine the next sequential integer ID (exactly like auto-increment in MySQL!)
      const lastBook = await Book.findOne().sort({ _id: -1 });
      const nextId = lastBook ? lastBook._id + 1 : 1;

      const book = await Book.create({
        _id: nextId,
        title,
        author,
        price: parseFloat(price),
        original_price: original_price !== undefined ? parseFloat(original_price) : null,
        genre,
        stock: stock !== undefined ? parseInt(stock, 10) : 10,
        cover_image: cover_image || null,
        description: description || '',
        is_featured: is_featured === true || is_featured === 'true' || is_featured === '1',
        is_deal: is_deal === true || is_deal === 'true' || is_deal === '1',
        isbn: isbn || null,
        pages: pages ? parseInt(pages, 10) : null,
        publisher: publisher || null,
      });

      return res.status(201).json(book);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/books/:id
   * @desc    Update a book record (Admin only)
   * @access  Private/Admin
   */
  async update(req, res, next) {
    try {
      const bookId = Number(req.params.id);
      if (isNaN(bookId)) {
        return res.status(404).json({ message: 'Book not found' });
      }
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Fields to update (handles partial updates elegantly just like Laravel $request->all())
      const updates = { ...req.body };
      
      // Parse numeric types explicitly to be safe
      if (updates.price !== undefined) updates.price = parseFloat(updates.price);
      if (updates.original_price !== undefined) updates.original_price = updates.original_price ? parseFloat(updates.original_price) : null;
      if (updates.stock !== undefined) updates.stock = parseInt(updates.stock, 10);
      if (updates.pages !== undefined) updates.pages = updates.pages ? parseInt(updates.pages, 10) : null;

      const updatedBook = await Book.findByIdAndUpdate(
        bookId,
        { $set: updates },
        { new: true, runValidators: true }
      );

      return res.json(updatedBook);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/books/:id
   * @desc    Delete a book (Admin only)
   * @access  Private/Admin
   */
  async destroy(req, res, next) {
    try {
      const bookId = Number(req.params.id);
      if (isNaN(bookId)) {
        return res.status(404).json({ message: 'Book not found' });
      }
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      await Book.findByIdAndDelete(bookId);
      return res.json({ message: 'Deleted' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/books/upload-image
   * @desc    Upload cover image (Admin only)
   * @access  Private/Admin
   */
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
      }

      // Express serves static files from the 'public' or static directory.
      // We return the relative path that the frontend expects.
      return res.json({
        url: `/covers/${req.file.filename}`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();
