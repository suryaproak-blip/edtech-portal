const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { getStatus } = require('../config/db');

// Check backend and DB status
router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    databaseConnected: getStatus()
  });
});

// Register student
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUser = (username || '').trim().toLowerCase();

    if (!cleanUser || !password) {
      return res.status(400).json({ success: false, error: 'Enter a username and password.' });
    }

    if (cleanUser === 'admin') {
      return res.status(400).json({ success: false, error: 'That username is reserved.' });
    }

    if (!getStatus()) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not currently connected. Please verify your connection string in server/.env.'
      });
    }

    const existing = await User.findOne({ username: cleanUser });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Username already taken. Please login instead.' });
    }

    const newUser = new User({
      username: cleanUser,
      password: password,
      role: 'student'
    });

    await newUser.save();

    console.log(`[MongoDB] New user registered: ${cleanUser}`);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully in MongoDB! Please log in.',
      user: {
        username: newUser.username,
        role: newUser.role,
        assignedCourses: newUser.assignedCourses,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('[MongoDB Register Error]', err);
    res.status(500).json({ success: false, error: 'Failed to register user: ' + err.message });
  }
});

// Sign In
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUser = (username || '').trim().toLowerCase();

    if (!cleanUser || !password) {
      return res.status(400).json({ success: false, error: 'Enter both username and password.' });
    }

    // Admin login
    if (cleanUser === 'admin') {
      if (password !== 'admin123') {
        return res.status(401).json({ success: false, error: 'Incorrect admin password.' });
      }
      return res.json({
        success: true,
        user: { username: 'admin', role: 'admin' }
      });
    }

    if (!getStatus()) {
      return res.status(503).json({
        success: false,
        error: 'MongoDB is not currently connected. Please verify your connection string in server/.env.'
      });
    }

    const student = await User.findOne({ username: cleanUser });
    if (!student) {
      return res.status(404).json({ success: false, error: 'No account found. Register below first.' });
    }

    if (student.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    return res.json({
      success: true,
      user: {
        username: student.username,
        role: student.role,
        assignedCourses: student.assignedCourses,
        completedLessons: student.completedLessons,
        quizAttempts: student.quizAttempts
      }
    });
  } catch (err) {
    console.error('[MongoDB Login Error]', err);
    res.status(500).json({ success: false, error: 'Login error: ' + err.message });
  }
});

// Get all students (Admin)
router.get('/students', async (req, res) => {
  try {
    if (!getStatus()) {
      return res.json({ success: true, students: [] });
    }
    const students = await User.find({ role: 'student' }).select('-password');
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Assign courses to student
router.post('/assign', async (req, res) => {
  try {
    const { student, courseId } = req.body;
    const cleanUser = (student || '').trim().toLowerCase();
    const user = await User.findOne({ username: cleanUser });
    if (!user) return res.status(404).json({ success: false, error: 'Student not found' });

    const idx = user.assignedCourses.indexOf(courseId);
    if (idx >= 0) {
      user.assignedCourses.splice(idx, 1);
    } else {
      user.assignedCourses.push(courseId);
    }
    await user.save();
    res.json({ success: true, assignedCourses: user.assignedCourses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle lesson completed
router.post('/progress', async (req, res) => {
  try {
    const { student, courseId, lesson } = req.body;
    const cleanUser = (student || '').trim().toLowerCase();
    const user = await User.findOne({ username: cleanUser });
    if (!user) return res.status(404).json({ success: false, error: 'Student not found' });

    const idx = user.completedLessons.findIndex(l => l.courseId === courseId && l.lesson === lesson);
    if (idx >= 0) {
      user.completedLessons.splice(idx, 1);
    } else {
      user.completedLessons.push({ courseId, lesson });
    }
    await user.save();
    res.json({ success: true, completedLessons: user.completedLessons });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Record quiz attempt
router.post('/quiz', async (req, res) => {
  try {
    const { student, course, score, total } = req.body;
    const cleanUser = (student || '').trim().toLowerCase();
    const user = await User.findOne({ username: cleanUser });
    if (!user) return res.status(404).json({ success: false, error: 'Student not found' });

    user.quizAttempts.push({
      course,
      score,
      total,
      date: new Date().toLocaleDateString()
    });
    await user.save();
    res.json({ success: true, quizAttempts: user.quizAttempts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
