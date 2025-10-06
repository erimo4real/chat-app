// src/routes/auth.route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Register
router.post('/register', userController.register);

// Login
router.post('/login', userController.login);

// Profile (protected) — require auth middleware when mounted in app
// router.get('/profile', userController.getProfile);


// Profile route (protected)
router.get('/profile', authMiddleware, userController.getProfile);

module.exports = router;
