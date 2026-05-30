const nodemailer = require('nodemailer');

/**
 * Send an email using SMTP configurations from .env,
 * with a fallback to console logging for painless local development.
 * 
 * @param {Object} options Options containing target email, subject, and HTML content.
 */
const sendEmail = async (options) => {
  const mailHost = process.env.MAIL_HOST;
  const mailPort = process.env.MAIL_PORT;
  const mailUser = process.env.MAIL_USERNAME;
  const mailPass = process.env.MAIL_PASSWORD;

  const mailFromAddress = process.env.MAIL_FROM_ADDRESS || 'no-reply@bookvault.io';
  const mailFromName = process.env.MAIL_FROM_NAME || 'BookVault';

  console.log(`✉️ Preparing mail dispatch to: ${options.email}...`);

  // Attempt to use nodemailer if username and password are provided
  if (mailUser && mailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: mailHost,
        port: parseInt(mailPort) || 587,
        secure: parseInt(mailPort) === 465, // True for port 465, false for other ports
        auth: {
          user: mailUser,
          pass: mailPass,
        },
        tls: {
          rejectUnauthorized: false // Helps avoid SSL/cert validation issues in some dev systems
        }
      });

      const mailOptions = {
        from: `"${mailFromName}" <${mailFromAddress}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Email successfully dispatched. Response MessageID: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`⚠️ SMTP Dispatch Failed: ${error.message}`);
      console.log('⚡ Triggering development console fallback...');
    }
  } else {
    console.log('⚠️ No SMTP credentials configured in .env.');
    console.log('⚡ Triggering development console fallback...');
  }

  // Fallback Console Logging (Perfect for local testing/presentations without internet/SMTP keys)
  const border = '========================================================================';
  console.log('\n' + border);
  console.log(`📧 DEVELOPMENT EMAIL SIMULATION LOG`);
  console.log(`📅 Timestamp: ${new Date().toISOString()}`);
  console.log(`📥 TO:        ${options.email}`);
  console.log(`🏷️ SUBJECT:   ${options.subject}`);
  console.log(border);
  
  // Extract text or log a readable summary of HTML contents
  if (options.subject.includes('Verification')) {
    // Extract OTP if present
    const otpMatch = options.html.match(/>(\d{6})</);
    const otp = otpMatch ? otpMatch[1] : 'NOT FOUND';
    console.log(`\n    🔑 YOUR 6-DIGIT VERIFICATION PASSCODE IS: [ ${otp} ]\n`);
    console.log(`    (Valid for 10 minutes. Use this code to complete registration)`);
  } else if (options.subject.includes('Welcome')) {
    console.log(`\n    🎉 WELCOME TO BOOKVAULT!`);
    console.log(`    🏷️ EXCLUSIVE 20% DISCOUNT COUPON CODE: [ BVAULT20 ]\n`);
  } else {
    // Truncate html to 300 chars for clean printing
    console.log(`\nCONTENT:\n${options.html.substring(0, 500)}...\n`);
  }
  console.log(border + '\n');

  return { success: true, simulated: true };
};

module.exports = sendEmail;
