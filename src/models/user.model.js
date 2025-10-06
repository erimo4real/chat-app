const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Keep your original fields and structure
const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Keep your existing structured asset info
  profileAsset: {
    assetId: String,
    originalName: String,
    storagePath: String,
    mediaType: String,
    sizeBytes: Number,
    publicUrl: String
  },

  // Add optional gender field from new plan (optional enhancement)
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password during login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
