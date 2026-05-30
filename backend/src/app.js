const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
// Whitelist frontend ports (matches React Vite defaults)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (
        allowedOrigins.indexOf(origin) !== -1 || 
        origin.startsWith('http://localhost:') || 
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      } else {
        return callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

// Standard Body Parsers (matches $request->all() behavior)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Cover Images statically (mapping Laravel /covers to Node static folders)
// Multer saves in backend/uploads/covers, we serve it under /covers
const coversPath = path.join(__dirname, '../uploads/covers');
app.use('/covers', express.static(coversPath));

// Serve default catalog covers from the React client's public folder
const clientCoversPath = path.join(__dirname, '../../haven-books/public/covers');
app.use('/covers', express.static(clientCoversPath));

// Check and print directory mappings
console.log(`📁 Cover Images served statically from: ${coversPath}`);
console.log(`📁 Default Covers served statically from: ${clientCoversPath}`);

// API Route Binding
app.use('/api', apiRoutes);

// Simple Welcome Route for status checking
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BookVault API! Server is running smoothly 🚀',
    version: '1.0.0',
    dbConnection: 'MongoDB (Mongoose)',
    auth: 'JWT (JSON Web Tokens)'
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Inject Global Exception Catcher
app.use(errorHandler);

module.exports = app;
