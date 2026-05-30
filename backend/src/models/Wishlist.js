const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: Number,
      ref: 'Book',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user_id = ret.user ? ret.user._id || ret.user.toString() : null;
        ret.book_id = ret.book ? (ret.book.id || ret.book._id || ret.book).toString() : null;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user_id = ret.user ? ret.user._id || ret.user.toString() : null;
        ret.book_id = ret.book ? (ret.book.id || ret.book._id || ret.book).toString() : null;
        return ret;
      },
    },
  }
);

// Create compound index for faster checks
WishlistSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);
