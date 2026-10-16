const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edtech_portal';

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false,
    }).then((m) => {
      console.log(`[MongoDB] Connected successfully to: ${uri.replace(/\/\/[^@]*@/, '//***:***@')}`);
      return m;
    }).catch((err) => {
      cached.promise = null;
      console.error('[MongoDB] Connection error:', err.message);
      return null;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

function getStatus() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, getStatus };
