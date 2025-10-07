require('dotenv').config();
const mongoose = require('mongoose');
//const bcrypt = require('bcryptjs');
const bcrypt = require('bcrypt');
const UserRepository = require('../src/repositories/user.repository');
const User = require('../src/models/user.model');

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chat_app_mvp';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected for seeding...');

    // Clear old data
    await User.deleteMany({});
    console.log('🧹 Old users cleared.');

    const hashedPassword = await bcrypt.hash('Password123', 10);

    // Generate 10 fake users
    const users = Array.from({ length: 10 }).map((_, i) => ({
      nickname: `user${String(i + 1).padStart(3, '0')}`,
      email: `user${String(i + 1).padStart(3, '0')}@example.com`,
      password: hashedPassword,
      gender: i % 2 === 0 ? 'male' : 'female',
      profileAsset: {
        assetId: `asset_${i + 1}`,
        originalName: `avatar${i + 1}.png`,
        storagePath: `/uploads/avatar${i + 1}.png`,
        mediaType: 'image/png',
        sizeBytes: 12345,
        publicUrl: `https://example.com/avatar${i + 1}.png`,
      },
    }));

    await UserRepository.bulkInsert(users);
    console.log('✅ 10 users seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
};

seedUsers();
