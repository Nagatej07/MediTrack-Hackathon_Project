const express = require('express');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authControllers');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/register
router.post('/register', registerUser);

// @route   POST /api/login
router.post('/login', loginUser);

// @route   GET /api/me
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
