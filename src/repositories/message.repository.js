// src/repositories/message.repository.js
const Message = require('../models/message.model');

class MessageRepository {
  async saveMessage(data) {
    const m = new Message(data);
    return m.save();
  }

  // returns messages newest first (caller may reverse)
  async getLastMessages(roomId, limit = 50) {
    return Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'nickname email')
      .lean();
  }
}

module.exports = new MessageRepository();
