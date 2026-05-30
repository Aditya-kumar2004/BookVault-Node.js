const Cart = require('../models/Cart');
const Book = require('../models/Book');

class CartController {
  /**
   * @route   GET /api/cart
   * @desc    Get the current user's cart
   * @access  Private
   */
  async index(req, res, next) {
    try {
      let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
      
      // If user doesn't have a cart, create an empty one
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      return res.json(cart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/cart/add
   * @desc    Add a book to the cart or increment quantity
   * @access  Private
   */
  async add(req, res, next) {
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

      // Find or create cart
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      // Check if item already exists in cart
      const existingItem = cart.items.find(item => item.book.toString() === bookId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ book: bookId, quantity: 1 });
      }

      await cart.save();

      // Return fully populated cart
      const populatedCart = await Cart.findById(cart._id).populate('items.book');
      return res.json(populatedCart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/cart/remove/:itemId
   * @desc    Remove an item from the cart
   * @access  Private
   */
  async remove(req, res, next) {
    try {
      const itemId = req.params.itemId;

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      // Filter out item by its nested ID
      cart.items = cart.items.filter(item => item._id.toString() !== itemId);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id).populate('items.book');
      return res.json(populatedCart);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   DELETE /api/cart/clear
   * @desc    Clear all items in the cart
   * @access  Private
   */
  async clear(req, res, next) {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      return res.json({ message: 'Cart cleared' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
