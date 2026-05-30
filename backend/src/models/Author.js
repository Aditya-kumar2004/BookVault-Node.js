const mongoose = require('mongoose');

const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add an author name'],
      unique: true,
      trim: true,
    },
    img: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
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

module.exports = mongoose.model('Author', AuthorSchema);
