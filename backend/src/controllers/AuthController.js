const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a secure JWT Token
 * @param {string} id User MongoDB ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

class AuthController {
  /**
   * @route   POST /api/register
   * @desc    Register a new user
   * @access  Public
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      // Validate inputs are provided (additional schema validation will trigger anyway)
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }

      // Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user (User schema hashes password automatically)
      // Wait, we can hash it here or let pre-save handles it. Since we haven't defined pre-save in User,
      // let's hash it here to be explicit and easy to trace for students!
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'Active',
      });

      const token = generateToken(user._id);

      // Convert mongoose doc to JSON and apply our transforms
      const userJson = user.toJSON();

      return res.status(201).json({
        user: userJson,
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/login
   * @desc    Authenticate user & get token
   * @access  Public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Find user and explicitly select password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if user account status is banned
      if (user.status === 'Banned') {
        return res.status(403).json({
          message: 'Your account has been banned. Please contact support.',
        });
      }

      const token = generateToken(user._id);

      const userJson = user.toJSON();

      return res.json({
        user: userJson,
        token: token,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/logout
   * @desc    Log out current user (client invalidates JWT token locally)
   * @access  Private
   */
  async logout(req, res, next) {
    try {
      // In decoupled JWT setups, the server-side logout is stateless.
      // We return success, and the React client clears Zustand local storage.
      return res.json({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/me
   * @desc    Get current user profile
   * @access  Private
   */
  async me(req, res, next) {
    try {
      // User is already fetched and attached by 'protect' middleware
      return res.json(req.user);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/profile
   * @desc    Update user profile details
   * @access  Private
   */
  async updateProfile(req, res, next) {
    try {
      const user = req.user;
      const { name, email, phone, bio, password, otp } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }

      // Check if email is already taken by another user
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }

      user.name = name;
      user.email = email;
      user.phone = phone || '';
      user.bio = bio || '';

      // Hash password if updating (requires OTP validation)
      if (password && password.trim() !== '') {
        if (password.length < 8) {
          return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }
        if (!otp) {
          return res.status(400).json({ message: 'OTP is required to change password' });
        }

        const OtpCode = require('../models/OtpCode');
        const emailLower = email.toLowerCase().trim();
        const record = await OtpCode.findOne({
          email: emailLower,
          otp: otp.toString().trim(),
          used: false,
          expires_at: { $gt: new Date(Date.now() - 15 * 60 * 1000) }, // 15 mins clock skew offset buffer
        });

        if (!record) {
          return res.status(422).json({
            message: 'Invalid or expired OTP. Please request a new one.',
          });
        }

        // Mark OTP as used
        record.used = true;
        await record.save();

        const bcrypt = require('bcryptjs');
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();

      const userJson = user.toJSON();

      return res.json({
        message: 'Profile updated successfully',
        user: userJson,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/users
   * @desc    List all registered users (Admin only)
   * @access  Private/Admin
   */
  async index(req, res, next) {
    try {
      const users = await User.find({});
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PUT /api/users/:id/toggle-status
   * @desc    Toggle block/unblock status of a user (Admin only)
   * @access  Private/Admin
   */
  async toggleStatus(req, res, next) {
    try {
      const targetId = req.params.id;
      const adminUser = req.user;

      // Prevent admin from banning themselves
      if (adminUser._id.toString() === targetId) {
        return res.status(400).json({ message: 'You cannot ban yourself.' });
      }

      const targetUser = await User.findById(targetId);
      if (!targetUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      targetUser.status = targetUser.status === 'Banned' ? 'Active' : 'Banned';
      await targetUser.save();

      const userJson = targetUser.toJSON();

      return res.json({
        message: `User status updated to ${targetUser.status} successfully.`,
        user: userJson,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/forgot-password
   * @desc    Verify email exists and send recovery OTP
   * @access  Public
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const emailLower = email.toLowerCase().trim();
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({ message: 'No account registered with this email address' });
      }

      // Generate OTP passcode
      const OtpCode = require('../models/OtpCode');
      await OtpCode.deleteMany({ email: emailLower, used: false });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins in future
      await OtpCode.create({
        email: emailLower,
        otp: otp,
        expires_at: expiresAt,
        used: false,
      });

      // Prepare beautiful HTML recovery passcode email
      const sendEmail = require('../utils/mailer');
      const otpChars = otp.split('');
      let otpHtml = '';
      otpChars.forEach(char => {
        otpHtml += `<span style="display: inline-block; width: 34px; height: 46px; line-height: 46px; text-align: center; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 22px; font-weight: 800; color: #F4623A; margin: 0 2px; font-family: 'Courier New', Courier, monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">${char}</span>`;
      });

      const recipientName = user.name || 'there';
      const emailHtml = `
<div style="background-color: #f3f4f6; padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
    <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
        <!-- Brand Top Accent Bar -->
        <div style="height: 6px; background: linear-gradient(90deg, #F4623A 0%, #1B4332 100%);"></div>
        
        <!-- Email Header / Logo -->
        <div style="padding: 24px 20px 16px 20px; border-bottom: 1px solid #f3f4f6; display: table; width: 100%; box-sizing: border-box;">
            <div style="display: table-cell; vertical-align: middle;">
                <span style="font-size: 24px; font-weight: bold; color: #1B4332; display: inline-block;">
                    📚 Book<span style="color: #F4623A;">Vault</span>
                </span>
            </div>
            <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">
                Password Recovery
            </div>
        </div>

        <!-- Email Body -->
        <div style="padding: 32px 20px; box-sizing: border-box;">
            <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 12px 0;">
                Reset Your Password
            </h2>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong style="color: #111827;">${recipientName}</strong>,
            </p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your BookVault account. Please use the 6-digit recovery passcode below to verify your identity and set a new password:
            </p>

            <!-- OTP Block -->
            <div style="background-color: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 12px; padding: 20px 10px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                    Your Recovery Passcode
                </div>
                <div style="text-align: center; margin-bottom: 14px; white-space: nowrap;">
                    ${otpHtml}
                </div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 14px;">
                    This passcode is valid for <strong style="color: #111827;">10 minutes</strong>.
                </div>
            </div>

            <!-- Warning and Assistance -->
            <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                💡 <strong>Security Note:</strong> If you did not request a password reset, please ignore this email. Your current password will remain safe and unchanged.
            </p>
        </div>

        <!-- Email Footer -->
        <div style="background-color: #f9fafb; padding: 20px 20px; text-align: center; border-top: 1px solid #f3f4f6; box-sizing: border-box;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">
                © 2026 BookVault. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                Delivered securely to protect your literary journey.
            </p>
        </div>
    </div>
</div>
      `;

      try {
        await sendEmail({
          email: emailLower,
          subject: 'BookVault Password Recovery Code',
          html: emailHtml,
        });
      } catch (err) {
        console.error("Background Recovery Mail Dispatch Failed:", err);
      }

      return res.json({ message: 'Recovery passcode sent successfully. Check your email.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/reset-password
   * @desc    Reset password using email, new password, and OTP
   * @access  Public
   */
  async resetPassword(req, res, next) {
    try {
      const { email, password, otp } = req.body;

      if (!email || !password || !otp) {
        return res.status(400).json({ message: 'Email, password, and OTP are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }

      const emailLower = email.toLowerCase().trim();

      // Find user
      const user = await User.findOne({ email: emailLower });
      if (!user) {
        return res.status(404).json({ message: 'No account registered with this email address' });
      }

      // Check OTP code validity
      const OtpCode = require('../models/OtpCode');
      const record = await OtpCode.findOne({
        email: emailLower,
        otp: otp.toString().trim(),
        used: false,
        expires_at: { $gt: new Date(Date.now() - 15 * 60 * 1000) }, // 15 mins clock skew offset buffer
      });

      if (!record) {
        return res.status(422).json({
          message: 'Invalid or expired OTP. Please request a new one.',
        });
      }

      // Mark OTP as used
      record.used = true;
      await record.save();

      // Hash password
      const bcrypt = require('bcryptjs');
      user.password = await bcrypt.hash(password, 10);
      await user.save();

      return res.json({
        message: 'Password has been successfully reset.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
