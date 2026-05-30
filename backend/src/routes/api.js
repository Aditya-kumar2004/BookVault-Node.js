const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import Controllers
const AuthController = require('../controllers/AuthController');
const BookController = require('../controllers/BookController');
const AuthorController = require('../controllers/AuthorController');
const CartController = require('../controllers/CartController');
const OrderController = require('../controllers/OrderController');
const CouponController = require('../controllers/CouponController');
const OtpController = require('../controllers/OtpController');
const RazorpayController = require('../controllers/RazorpayController');
const GoogleAuthController = require('../controllers/GoogleAuthController');
const WishlistController = require('../controllers/WishlistController');

// Import Middlewares
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Import Seeder module for migration runner
const { seedDatabase } = require('../utils/seeder');

// Configure Multer for Cover Image Uploads
const coversDir = path.join(__dirname, '../uploads/covers');
try {
  if (!fs.existsSync(coversDir)) {
    fs.mkdirSync(coversDir, { recursive: true });
  }
} catch (err) {
  console.warn("⚠️ Warning: Failed to create local uploads directory (normal on serverless read-only filesystems like Vercel):", err.message);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, coversDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit (matches Laravel max:2048)
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|svg|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif, svg, webp) are allowed!'));
    }
  }
});

/*
 ==========================================
 🛠️ DATABASE MIGRATIONS / SEEDING ENDPOINTS
 ==========================================
*/
const runMigrations = async (req, res, next) => {
  try {
    const result = await seedDatabase(false);
    return res.json({
      status: 'success',
      message: 'Migrations and seeding executed successfully!',
      output: `MongoDB successfully initialized with ${result.count} books, default admin account (admin@bookvault.com), and starter coupons.`
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Migrations failed to execute: ' + error.message
    });
  }
};

router.get('/run-migrations', runMigrations);
router.get('/run_migrations', runMigrations);
router.get('/run migrations', runMigrations);
router.get('/run%20migrations', runMigrations);

/*
 ==========================================
 👤 PUBLIC AUTHENTICATION & GOOGLE OAUTH
 ==========================================
*/
router.get('/auth/google', (req, res, next) => GoogleAuthController.redirect(req, res, next));
router.get('/auth/google/callback', (req, res, next) => GoogleAuthController.callback(req, res, next));

router.post('/register', (req, res, next) => AuthController.register(req, res, next));
router.post('/login', (req, res, next) => AuthController.login(req, res, next));
router.post('/auth/forgot-password', (req, res, next) => AuthController.forgotPassword(req, res, next));
router.post('/auth/reset-password', (req, res, next) => AuthController.resetPassword(req, res, next));

/*
 ==========================================
 🔑 OTP CODE DISPATCH & NEWSLETTERS
 ==========================================
*/
router.post('/otp/send', (req, res, next) => OtpController.sendOtp(req, res, next));
router.post('/otp/verify', (req, res, next) => OtpController.verifyOtp(req, res, next));
router.post('/newsletter/subscribe', (req, res, next) => OtpController.subscribeNewsletter(req, res, next));

/*
 ==========================================
 📚 PUBLIC BOOKS & AUTHORS RESOURCES
 ==========================================
*/
router.get('/books', (req, res, next) => BookController.index(req, res, next));
router.get('/books/:id', (req, res, next) => BookController.show(req, res, next));
router.get('/authors', (req, res, next) => AuthorController.index(req, res, next));

/*
 ==========================================
 🔐 PROTECTED ROUTING PIPELINE (JWT JWT)
 ==========================================
*/
router.use(protect); // Applies global JWT auth verification past this point

router.post('/logout', (req, res, next) => AuthController.logout(req, res, next));
router.get('/me', (req, res, next) => AuthController.me(req, res, next));
router.put('/profile', (req, res, next) => AuthController.updateProfile(req, res, next));

// User Cart Operations
router.get('/cart', (req, res, next) => CartController.index(req, res, next));
router.post('/cart/add', (req, res, next) => CartController.add(req, res, next));
router.delete('/cart/remove/:itemId', (req, res, next) => CartController.remove(req, res, next));
router.delete('/cart/clear', (req, res, next) => CartController.clear(req, res, next));

// User Wishlist Operations
router.get('/wishlist', (req, res, next) => WishlistController.index(req, res, next));
router.post('/wishlist/toggle', (req, res, next) => WishlistController.toggle(req, res, next));

// User Order & Checkout Operations
router.get('/orders', (req, res, next) => OrderController.index(req, res, next));
router.post('/orders', (req, res, next) => OrderController.store(req, res, next));
router.put('/orders/:id/cancel', (req, res, next) => OrderController.cancelOrder(req, res, next));
router.post('/coupons/validate', (req, res, next) => CouponController.validateCoupon(req, res, next));

// Razorpay E-Commerce Gateways
router.post('/razorpay/order', (req, res, next) => RazorpayController.apiCreateOrder(req, res, next));
router.post('/razorpay/verify', (req, res, next) => RazorpayController.apiVerifyPayment(req, res, next));

/*
 ==========================================
 👑 PRIVILEGED ADMINISTRATOR CHANNELS
 ==========================================
*/
router.use(admin); // Restricts access to admin users only past this point

// Order status override
router.put('/orders/:id/status', (req, res, next) => OrderController.updateStatus(req, res, next));

// Admin catalog controls
router.post('/books', (req, res, next) => BookController.store(req, res, next));
router.post('/books/upload-image', upload.single('image'), (req, res, next) => BookController.uploadImage(req, res, next));
router.put('/books/:id', (req, res, next) => BookController.update(req, res, next));
router.delete('/books/:id', (req, res, next) => BookController.destroy(req, res, next));

// User moderation lists
router.get('/users', (req, res, next) => AuthController.index(req, res, next));
router.put('/users/:id/toggle-status', (req, res, next) => AuthController.toggleStatus(req, res, next));

// Promotional Coupon controls
router.get('/coupons', (req, res, next) => CouponController.index(req, res, next));
router.post('/coupons', (req, res, next) => CouponController.store(req, res, next));
router.put('/coupons/:id', (req, res, next) => CouponController.update(req, res, next));
router.delete('/coupons/:id', (req, res, next) => CouponController.destroy(req, res, next));

// Author management controls (except public listing)
router.post('/authors', (req, res, next) => AuthorController.store(req, res, next));
router.put('/authors/:id', (req, res, next) => AuthorController.update(req, res, next));
router.delete('/authors/:id', (req, res, next) => AuthorController.destroy(req, res, next));

module.exports = router;
