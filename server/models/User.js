const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [2, 'Username must be at least 2 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  assignedCourses: {
    type: [String],
    default: []
  },
  completedLessons: [{
    courseId: String,
    lesson: String
  }],
  quizAttempts: [{
    course: String,
    score: Number,
    total: Number,
    date: { type: String, default: () => new Date().toLocaleDateString() }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
