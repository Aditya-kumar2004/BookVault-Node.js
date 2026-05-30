const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Generate a secure JWT Token for OAuth User
 * @param {string} id User MongoDB ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

class GoogleAuthController {
  /**
   * @route   GET /api/auth/google
   * @desc    Redirect the user to Google's OAuth consent screen
   * @access  Public
   */
  async redirect(req, res, next) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const redirectUri = process.env.GOOGLE_REDIRECT_URL;

      if (!clientId || !redirectUri) {
        return res.status(500).json({
          message: 'Google OAuth configuration is missing on the server! Please check GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URL in .env.'
        });
      }

      // Replicates Laravel Socialite redirect() flow transparently
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ];

      const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `prompt=select_account&` +
        `state=bookvault_state`;

      console.log('📡 Redirecting browser to Google OAuth consent page...');
      return res.redirect(googleOAuthUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/google/callback
   * @desc    Google auth callback, exchange authorization code, create user and redirect to React
   * @access  Public
   */
  async callback(req, res, next) {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:8080').replace(/\/$/, '');
    const { code, error } = req.query;

    if (error || !code) {
      console.error('⚠️ Google OAuth callback received error or no code:', error);
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }

    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URL;

      console.log('📡 Exchanging authorization code for Google Access Token...');

      // 1. Exchange code for Access Token (standard HTTP POST to Google)
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('❌ Code Exchange Error:', tokenData.error_description);
        return res.redirect(`${frontendUrl}/login?error=google_failed`);
      }

      // 2. Fetch User Profiles using Google Access Token
      console.log('📡 Fetching User Profile details from Google userinfo API...');
      const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser = await userinfoResponse.json();

      if (!googleUser.email) {
        console.error('❌ User email not returned by Google.');
        return res.redirect(`${frontendUrl}/login?error=google_failed`);
      }

      const emailLower = googleUser.email.toLowerCase().trim();

      // 3. Find or Create User in MongoDB
      let user = await User.findOne({ email: emailLower });

      if (!user) {
        // Hash a secure random password for OAuth signup
        const bcrypt = require('bcryptjs');
        const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        user = await User.create({
          name: googleUser.name || googleUser.given_name || 'Google User',
          email: emailLower,
          password: hashedPassword,
          role: 'user',
          status: 'Active',
        });
        console.log(`👤 OAuth Signup: Registered new Google user: ${emailLower}`);
      } else {
        console.log(`👤 OAuth Login: Authenticated returning Google user: ${emailLower}`);
      }

      // Check account block status
      if (user.status === 'Banned') {
        console.warn(`⚠️ Banned user ${emailLower} blocked from OAuth sign-in.`);
        return res.redirect(`${frontendUrl}/login?error=account_banned`);
      }

      // 4. Generate JWT & Redirect to frontend success page
      const token = generateToken(user._id);

      const userPayload = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      console.log('📡 Google Login Handshake successful. Redirecting back to React SPA...');
      const redirectSuccessUrl = `${frontendUrl}/auth/google/success?token=${token}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
      return res.redirect(redirectSuccessUrl);

    } catch (err) {
      console.error('💥 Google Callback Handshake crashed:', err.message);
      return res.redirect(`${frontendUrl}/login?error=google_failed`);
    }
  }
}

module.exports = new GoogleAuthController();
