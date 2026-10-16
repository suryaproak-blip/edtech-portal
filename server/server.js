const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const { connectDB, getStatus } = require('./config/db');
const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB immediately
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected for API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDB();
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    databaseConnected: getStatus(),
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend files from project root when running standalone
const clientDir = path.join(__dirname, '..');
app.use(express.static(clientDir));

// Fallback for SPA routing to index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Only listen when executed directly, not inside Vercel serverless function
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` EdTech Portal Server running at http://localhost:${PORT}`);
    console.log(` MongoDB Status: ${getStatus() ? 'Connected' : 'Connecting / Check .env'}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
