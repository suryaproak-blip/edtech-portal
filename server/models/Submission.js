const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  student: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  course: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  aiScore: {
    type: Number,
    default: 0
  },
  aiNotes: [String],
  plagMax: {
    type: Number,
    default: 0
  },
  plagWith: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: () => new Date().toLocaleString()
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
