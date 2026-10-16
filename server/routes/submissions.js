const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const { getStatus } = require('../config/db');

// Get all submissions
router.get('/', async (req, res) => {
  try {
    if (!getStatus()) return res.json({ success: true, submissions: [] });
    const submissions = await Submission.find().sort({ createdAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new submission
router.post('/', async (req, res) => {
  try {
    const { student, course, code, aiScore, aiNotes, plagMax, plagWith } = req.body;
    if (!student || !course || !code) {
      return res.status(400).json({ success: false, error: 'Missing required submission fields' });
    }
    const submission = new Submission({
      student: student.trim().toLowerCase(),
      course,
      code,
      aiScore: aiScore || 0,
      aiNotes: aiNotes || [],
      plagMax: plagMax || 0,
      plagWith: plagWith || ''
    });
    await submission.save();
    res.status(201).json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
