const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    book: {
      type: Number,
      ref: 'Book',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : null;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : null;
        return ret;
      },
    },
  }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [CartItemSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        // Rename user to user_id to match Laravel's relational model output if needed,
        // though the React client uses Zustand local cart state, we'll keep both standard property formats
        ret.user_id = ret.user ? ret.user.toString() : null;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user_id = ret.user ? ret.user.toString() : null;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Cart', CartSchema);
