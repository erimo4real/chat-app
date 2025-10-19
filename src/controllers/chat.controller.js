// src/controllers/chat.controller.js
const UserRepository = require('../repositories/user.repository');
const MessageRepository = require('../repositories/message.repository');

exports.showChat = async (req, res) => {
  try {
    // users list for left panel (exclude current)
    const users = (UserRepository.getAllUsers)
      ? await UserRepository.getAllUsers()
      : [];

    // render chat view; current user available via req.user from auth middleware
    res.render('chat', { title: 'Chat', user: req.user, users });
  } catch (err) {
    console.error('ChatController.showChat error:', err);
    res.status(500).render('error', { title: 'Error', message: 'Unable to open chat.' });
  }
};
