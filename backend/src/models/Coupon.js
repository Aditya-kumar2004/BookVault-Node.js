const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discount_type: {
      type: String,
      required: [true, 'Please specify discount type'],
      enum: ['percent', 'fixed'],
    },
    discount_value: {
      type: Number,
      required: [true, 'Please add a discount value'],
      min: 0,
    },
    max_uses: {
      type: Number,
      default: null,
      min: 1,
    },
    uses_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiry_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        // Format expiry date to simple ISO string or date
        if (ret.expiry_date) {
          ret.expiry_date = ret.expiry_date.toISOString().split('T')[0];
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Coupon', CouponSchema);
