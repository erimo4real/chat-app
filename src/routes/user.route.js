// src/routes/user.route.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Views (GET)
router.get('/register', userController.showRegister);
router.get('/login', userController.showLogin);
router.get('/logout', userController.logout);
router.get('/profile', authMiddleware, userController.getProfile);

// Actions (POST)
router.post('/register', userController.register);
router.post('/login', userController.login);

// API endpoint (for Postman / debugging)
router.post('/api/login', userController.loginApi);

module.exports = router;
