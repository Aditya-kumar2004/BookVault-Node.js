const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

class WishlistController {
  /**
   * @route   GET /api/wishlist
   * @desc    Get current user's wishlisted books
   * @access  Private
   */
  async index(req, res, next) {
    try {
      const wishlist = await Wishlist.find({ user: req.user._id })
        .populate('book')
        .sort({ createdAt: -1 });
      return res.json(wishlist);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/wishlist/toggle
   * @desc    Toggle wishlist bookmark status for a book
   * @access  Private
   */
  async toggle(req, res, next) {
    try {
      const bookId = req.body.book_id || req.body.bookId;

      if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required' });
      }

      // Check if book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }

      // Check if already in wishlist
      const item = await Wishlist.findOne({ user: req.user._id, book: bookId });

      if (item) {
        await Wishlist.findByIdAndDelete(item._id);
        return res.json({ wishlisted: false });
      }

      await Wishlist.create({
        user: req.user._id,
        book: bookId,
      });

      return res.json({ wishlisted: true });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();
