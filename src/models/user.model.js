const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileAsset: {
    assetId: String,
    originalName: String,
    storagePath: String,
    mediaType: String,
    sizeBytes: Number,
    publicUrl: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
