const User = require('../models/user.model');

class UserRepository {
  // Create a new user
  async createUser(data) {
    try {
      const user = new User(data);
      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email (used in login)
  async findByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Update user profile data
  async updateUser(id, updateData) {
    try {
      return await User.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete a user
  async deleteUser(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Get all users (for admin/debugging)
  async getAllUsers() {
    try {
      return await User.find().select('-password');
    } catch (error) {
      throw new Error(`Error retrieving users: ${error.message}`);
    }
  }

  // Bulk insert users (used only for seeding)
  async bulkInsert(users) {
    try {
      return await User.insertMany(users);
    } catch (error) {
      throw new Error(`Error bulk inserting users: ${error.message}`);
    }
  }
  
}

module.exports = new UserRepository();
