const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const app = require('./src/app');
const connectDB = require('./src/config/db');

// Establish persistent MongoDB connection
connectDB();

// Determine Port
const PORT = process.env.PORT || 8000;

let server;

// Only start the HTTP listener if not running in Vercel serverless environment
if (!process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`\n🚀 ===================================================`);
    console.log(`🚀 BookVault Express Backend Server is running!`);
    console.log(`🚀 PORT:            http://localhost:${PORT}`);
    console.log(`🚀 Mode:            ${process.env.NODE_ENV || 'development'}`);
    console.log(`🚀 Seeder route:    http://localhost:${PORT}/api/run-migrations`);
    console.log(`🚀 ===================================================\n`);
  });

  // Graceful shut down locks
  process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Promise Rejection: ${err.message}`);
    // Shut server down
    if (server) {
      server.close(() => process.exit(1));
    } else {
      process.exit(1);
    }
  });
}

// Export app for Vercel Serverless Function compatibility
module.exports = app;
