const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edtech_portal';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${uri.replace(/\/\/[^@]*@/, '//***:***@')}`);
  } catch (err) {
    isConnected = false;
    console.error('[MongoDB] Connection error:', err.message);
    console.warn('[MongoDB] Please ensure MongoDB is running or check your MONGODB_URI in .env');
  }
}

function getStatus() {
  return isConnected;
}

module.exports = { connectDB, getStatus };
