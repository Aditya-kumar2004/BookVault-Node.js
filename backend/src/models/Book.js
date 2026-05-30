const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a book title'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Please add an author name'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    original_price: {
      type: Number,
      default: null,
    },
    cover_image: {
      type: String,
      default: null,
    },
    genre: {
      type: String,
      required: [true, 'Please specify a genre'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing isbns while enforcing uniqueness on present ones
      trim: true,
    },
    rating: {
      type: Number,
      default: 0.0,
      min: 0,
      max: 5,
    },
    pages: {
      type: Number,
      default: null,
    },
    publisher: {
      type: String,
      default: null,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_deal: {
      type: Boolean,
      default: false,
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

// Add text indexes for optimal searching in search routes
BookSchema.index({ title: 'text', author: 'text' });

module.exports = mongoose.model('Book', BookSchema);
