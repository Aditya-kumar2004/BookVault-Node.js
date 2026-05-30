const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema(
  {
    book: {
      type: Number,
      ref: 'Book',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit_price: {
      type: Number,
      required: true,
      min: 0,
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

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    shipping_address: {
      type: String,
      required: true,
      default: 'Default Address',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user_id = ret.user ? ret.user._id || ret.user.toString() : null;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.user_id = ret.user ? ret.user._id || ret.user.toString() : null;
        return ret;
      },
    },
  }
);

// Define nested items field
OrderSchema.add({
  items: [OrderItemSchema],
});

module.exports = mongoose.model('Order', OrderSchema);
