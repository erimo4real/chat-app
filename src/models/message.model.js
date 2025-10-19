// src/models/message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // 'global', 'group:<id>', 'dm:<a>-<b>'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text','image','video','system'], default: 'text' },
  meta: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
