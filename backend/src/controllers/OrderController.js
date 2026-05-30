const Order = require('../models/Order');
const Book = require('../models/Book');
const Coupon = require('../models/Coupon');
const Cart = require('../models/Cart');

class OrderController {
  /**
   * @route   GET /api/orders
   * @desc    Get user order history or all orders if Admin
   * @access  Private
   */
  async index(req, res, next) {
    try {
      const user = req.user;

      if (user.role === 'admin') {
        const allOrders = await Order.find({})
          .populate('items.book')
          .populate('user')
          .sort({ createdAt: -1 });
        return res.json(allOrders);
      }

      const userOrders = await Order.find({ user: user._id })
        .populate('items.book')
        .sort({ createdAt: -1 });
      return res.json(userOrders);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/orders/:id/status
   * @desc    Update order shipping/processing status (Admin only)
   * @access  Private/Admin
   */
  async updateStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!status || !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid or missing status' });
      }

      const order = await Order.findById(orderId).populate('items.book');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // If transitioning to cancelled from a non-cancelled state, restore inventory stock
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          if (item.book) {
            await Book.findByIdAndUpdate(item.book._id, { $inc: { stock: item.quantity } });
          }
        }
      }

      order.status = status;
      await order.save();

      const updatedOrder = await Order.findById(orderId)
        .populate('items.book')
        .populate('user');
      
      return res.json({
        message: 'Order status updated successfully',
        order: updatedOrder
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/orders
   * @desc    Create a new order (supports Zustand array and DB Cart fallback)
   * @access  Private
   */
  async store(req, res, next) {
    try {
      const user = req.user;
      const { items, coupon_code, shipping_address } = req.body;

      let orderItems = [];
      let total = 0;
      let coupon = null;

      // Case A: Frontend sends direct array (Zustand store format)
      if (items && Array.isArray(items) && items.length > 0) {
        // Validate stock and calculate total first
        for (const item of items) {
          // React sends book.id or book._id
          const bookId = item.book.id || item.book._id;
          const book = await Book.findById(bookId);
          if (!book) {
            return res.status(404).json({ message: `Book not found.` });
          }

          if (book.stock < item.qty) {
            return res.status(400).json({
              message: `Sorry, '${book.title}' has only ${book.stock} items in stock.`
            });
          }

          total += book.price * item.qty;
          orderItems.push({
            book: book._id,
            quantity: item.qty,
            unit_price: book.price
          });
        }

        // Validate coupon
        if (coupon_code && coupon_code.trim() !== '') {
          const code = coupon_code.toUpperCase().trim();
          coupon = await Coupon.findOne({ code });

          if (!coupon) {
            return res.status(400).json({ message: 'Invalid coupon code.' });
          }

          // Expiry check
          if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date() && new Date(coupon.expiry_date).toDateString() !== new Date().toDateString()) {
            return res.status(400).json({ message: 'This coupon has expired.' });
          }

          // Max uses check
          if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
            return res.status(400).json({ message: 'This coupon usage limit has been reached.' });
          }

          // Discount calculations
          let discount = 0;
          if (coupon.discount_type === 'percent') {
            discount = total * (coupon.discount_value / 100);
          } else {
            discount = coupon.discount_value;
          }
          total = Math.max(0, total - discount);
        }

        // Create Order document
        const order = await Order.create({
          user: user._id,
          total_amount: parseFloat(total.toFixed(2)),
          shipping_address: shipping_address || 'Default Address',
          status: 'pending',
          items: orderItems
        });

        // Decrement stock for books
        for (const item of items) {
          const bookId = item.book.id || item.book._id;
          await Book.findByIdAndUpdate(bookId, { $inc: { stock: -item.qty } });
        }

        // Increment coupon count
        if (coupon) {
          coupon.uses_count += 1;
          await coupon.save();
        }

        const populatedOrder = await Order.findById(order._id).populate('items.book');
        return res.status(201).json({
          message: 'Order placed',
          order: populatedOrder
        });
      }

      // Case B: Fallback to DB Cart Tables
      const cart = await Cart.findOne({ user: user._id }).populate('items.book');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Validate stock
      for (const item of cart.items) {
        if (!item.book) {
          return res.status(404).json({ message: 'A book in your cart no longer exists.' });
        }
        if (item.book.stock < item.quantity) {
          return res.status(400).json({
            message: `Sorry, '${item.book.title}' has only ${item.book.stock} items in stock.`
          });
        }
      }

      // Calculate total
      total = cart.items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

      // Validate coupon
      if (coupon_code && coupon_code.trim() !== '') {
        const code = coupon_code.toUpperCase().trim();
        coupon = await Coupon.findOne({ code });

        if (coupon) {
          let valid = true;
          if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date() && new Date(coupon.expiry_date).toDateString() !== new Date().toDateString()) {
            valid = false;
          }
          if (coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses) {
            valid = false;
          }

          if (valid) {
            let discount = 0;
            if (coupon.discount_type === 'percent') {
              discount = total * (coupon.discount_value / 100);
            } else {
              discount = coupon.discount_value;
            }
            total = Math.max(0, total - discount);
          }
        }
      }

      // Populate order items
      cart.items.forEach(item => {
        orderItems.push({
          book: item.book._id,
          quantity: item.quantity,
          unit_price: item.book.price
        });
      });

      const order = await Order.create({
        user: user._id,
        total_amount: parseFloat(total.toFixed(2)),
        shipping_address: shipping_address || 'Default Address',
        status: 'pending',
        items: orderItems
      });

      // Decrement stock and increment coupon uses
      for (const item of cart.items) {
        await Book.findByIdAndUpdate(item.book._id, { $inc: { stock: -item.quantity } });
      }

      if (coupon) {
        coupon.uses_count += 1;
        await coupon.save();
      }

      // Empty database cart items
      cart.items = [];
      await cart.save();

      const populatedOrder = await Order.findById(order._id).populate('items.book');
      return res.status(201).json({
        message: 'Order placed',
        order: populatedOrder
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/orders/:id/cancel
   * @desc    Cancel order (User cancellation check)
   * @access  Private
   */
  async cancelOrder(req, res, next) {
    try {
      const orderId = req.params.id;
      const user = req.user;

      const order = await Order.findOne({ _id: orderId, user: user._id }).populate('items.book');
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check cancellable state
      if (!['pending', 'processing'].includes(order.status)) {
        return res.status(400).json({
          message: `Cannot cancel an order that is already ${order.status}.`
        });
      }

      // Restore book inventory
      for (const item of order.items) {
        if (item.book) {
          await Book.findByIdAndUpdate(item.book._id, { $inc: { stock: item.quantity } });
        }
      }

      order.status = 'cancelled';
      await order.save();

      return res.json({
        message: 'Order cancelled successfully',
        order: order
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
