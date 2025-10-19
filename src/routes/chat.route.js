// src/routes/chat.route.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, chatController.showChat);

module.exports = router;
