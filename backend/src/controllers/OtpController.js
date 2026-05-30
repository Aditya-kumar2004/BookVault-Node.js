const OtpCode = require('../models/OtpCode');
const Newsletter = require('../models/Newsletter');
const sendEmail = require('../utils/mailer');

class OtpController {
  /**
   * @route   POST /api/otp/send
   * @desc    Generate a 6-digit OTP, store in DB, and email it to the user
   * @access  Public
   */
  async sendOtp(req, res, next) {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const emailLower = email.toLowerCase().trim();

      // Invalidate any previous unused OTPs for this email
      await OtpCode.deleteMany({ email: emailLower, used: false });

      // Generate a cryptographically random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store OTP (valid for 10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins in future
      await OtpCode.create({
        email: emailLower,
        otp: otp,
        expires_at: expiresAt,
        used: false,
      });

      // Prepare OTP Spans HTML for rich styling
      const otpChars = otp.split('');
      let otpHtml = '';
      otpChars.forEach(char => {
        otpHtml += `<span style="display: inline-block; width: 34px; height: 46px; line-height: 46px; text-align: center; background-color: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 22px; font-weight: 800; color: #F4623A; margin: 0 2px; font-family: 'Courier New', Courier, monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">${char}</span>`;
      });

      const recipientName = name || 'there';
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
                Verification
            </div>
        </div>

        <!-- Email Body -->
        <div style="padding: 32px 20px; box-sizing: border-box;">
            <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0 0 12px 0;">
                Verify Your Email Address
            </h2>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                Hi <strong style="color: #111827;">${recipientName}</strong>,
            </p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                Welcome to BookVault! To complete your registration and secure your new account, please use the 6-digit verification code below:
            </p>

            <!-- OTP Block -->
            <div style="background-color: #f9fafb; border: 1px dashed #e5e7eb; border-radius: 12px; padding: 20px 10px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                    Your One-Time Passcode
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
                💡 <strong>Security Note:</strong> If you did not request this verification code, please ignore this email or reach out to us at <a href="mailto:support@bookvault.io" style="color: #1B4332; text-decoration: none; font-weight: 600;">support@bookvault.io</a>.
            </p>
        </div>

        <!-- Email Footer -->
        <div style="background-color: #f9fafb; padding: 20px 20px; text-align: center; border-top: 1px solid #f3f4f6; box-sizing: border-box;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">
                © 2026 BookVault. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                Delivered with care to secure your literary journey.
            </p>
        </div>
    </div>
</div>
      `;

      // Dispatch Email in the background asynchronously so the client gets an instant response under 50ms
      sendEmail({
        email: emailLower,
        subject: 'Your BookVault Verification Code',
        html: emailHtml,
      }).catch(err => {
        console.error("Background SMTP Dispatch Failed:", err);
      });

      return res.json({ message: 'OTP sent successfully. Check your email.' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/otp/verify
   * @desc    Verify the submitted OTP
   * @access  Public
   */
  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP code are required' });
      }

      const emailLower = email.toLowerCase().trim();

      const record = await OtpCode.findOne({
        email: emailLower,
        otp: otp.toString().trim(),
        used: false,
        expires_at: { $gt: new Date(Date.now() - 15 * 60 * 1000) }, // Buffer to ignore up to 15 mins local clock skew/out-of-sync drift
      });

      if (!record) {
        return res.status(422).json({
          message: 'Invalid or expired OTP. Please request a new one.',
        });
      }

      // Mark OTP as used
      record.used = true;
      await record.save();

      return res.json({
        message: 'OTP verified successfully.',
        verified: true,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/newsletter/subscribe
   * @desc    Subscribe a user to the newsletter and send welcome offer email
   * @access  Public
   */
  async subscribeNewsletter(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const emailLower = email.toLowerCase().trim();

      // Save newsletter subscription if doesn't already exist
      const subscribed = await Newsletter.findOne({ email: emailLower });
      if (!subscribed) {
        await Newsletter.create({ email: emailLower });
      }

      // Create a nice welcome email HTML template matching OtpController.php
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const welcomeHtml = `
<div style="background-color: #f3f4f6; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
    <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
        <!-- Brand Top Accent Bar -->
        <div style="height: 6px; background: linear-gradient(90deg, #F4623A 0%, #1B4332 100%);"></div>
        
        <!-- Email Header / Logo -->
        <div style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f3f4f6; display: table; width: 100%; box-sizing: border-box;">
            <div style="display: table-cell; vertical-align: middle;">
                <span style="font-size: 24px; font-weight: bold; color: #1B4332; display: inline-block;">
                    📚 Book<span style="color: #F4623A;">Vault</span>
                </span>
            </div>
            <div style="display: table-cell; vertical-align: middle; text-align: right; font-size: 11px; font-weight: 800; color: #F4623A; text-transform: uppercase; letter-spacing: 1.5px;">
                Welcome Offer
            </div>
        </div>

        <!-- Email Body -->
        <div style="padding: 40px 32px; box-sizing: border-box;">
            <h2 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0 0 12px 0;">
                Thank you for subscribing!
            </h2>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 24px 0;">
                We are thrilled to welcome you to the <strong>BookVault</strong> family. Get ready for curations of the best-selling masterpieces, handpicked literature recommendations, exclusive subscriber-only deals, and first access to new releases!
            </p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin: 0 0 32px 0;">
                As a token of our appreciation, please enjoy <strong>20% off</strong> your first order with us. Copy the exclusive promo code below and apply it at checkout:
            </p>

            <!-- Discount Badge Block -->
            <div style="background-color: #f0f7f4; border: 1.5px dashed #1B4332; border-radius: 16px; padding: 24px; text-align: center; margin: 32px 0;">
                <div style="font-size: 11px; font-weight: 800; color: #1B4332; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">
                    Your Exclusive Coupon Code
                </div>
                <div style="font-size: 36px; font-weight: 900; color: #F4623A; letter-spacing: 2px; font-family: 'Courier New', Courier, monospace; display: inline-block;">
                    BVAULT20
                </div>
                <div style="font-size: 12px; color: #1B4332; font-weight: 600; margin-top: 10px;">
                    Valid for all books & collections
                </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 36px 0 24px 0;">
                <a href="${frontendUrl}" style="display: inline-block; background: linear-gradient(90deg, #F4623A 0%, #ff7e5f 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 15px; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 15px rgba(244, 98, 58, 0.35); text-transform: uppercase; letter-spacing: 1px;">
                    Shop Now & Save
                </a>
            </div>

            <!-- Footer warning -->
            <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin: 32px 0 0 0; border-top: 1px solid #f3f4f6; padding-top: 24px;">
                💡 <strong>Need any assistance?</strong> If you have any questions about your discount, ordering, or shipping, we'd love to help! Reach out directly at <a href="mailto:support@bookvault.io" style="color: #1B4332; text-decoration: none; font-weight: 600;">support@bookvault.io</a>.
            </p>
        </div>

        <!-- Email Footer -->
        <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #f3f4f6; box-sizing: border-box;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">
                © 2026 BookVault. All rights reserved.
            </p>
            <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                Delivering literary magic directly to your inbox.
            </p>
        </div>
    </div>
</div>
      `;

      // Dispatch Welcome Email in the background asynchronously so the client gets an instant response under 50ms
      sendEmail({
        email: emailLower,
        subject: 'Welcome to BookVault! Here is your 20% discount code 🎉',
        html: welcomeHtml,
      }).catch(err => {
        console.error("Background newsletter mail dispatch failed:", err);
      });

      return res.json({
        message: 'Subscribed successfully! Check your inbox for the 20% discount code 🎉',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OtpController();
