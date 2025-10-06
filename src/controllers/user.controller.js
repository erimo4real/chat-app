// src/controllers/user.controller.js
const UserRepository = require('../repositories/user.repository');
const UserDTO = require('../dtos/user.dto');
const { generateToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { nickname, email, password, gender } = req.body;

    if (!nickname || !email || !password) {
      return res.status(400).json({ message: 'Nickname, email and password are required.' });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    // IMPORTANT: do NOT hash here — model pre-save will hash the password
    const created = await UserRepository.createUser({ nickname, email, password, gender });

    const dto = new UserDTO(created);
    const token = generateToken({ id: created._id, email: created.email });

    return res.status(201).json({ user: dto, token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required.' });

    const user = await UserRepository.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isValid = await user.comparePassword(password);
    if (!isValid) return res.status(401).json({ message: 'Invalid email or password.' });

    const dto = new UserDTO(user);
    const token = generateToken({ id: user._id, email: user.email });

    return res.json({ user: dto, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await UserRepository.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const dto = new UserDTO(user);
    return res.json(dto);
  } catch (err) {
    console.error('Profile error:', err);
    return res.status(500).json({ message: 'Server error retrieving profile.' });
  }
};
