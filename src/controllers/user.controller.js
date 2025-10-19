// src/controllers/user.controller.js
const UserRepository = require('../repositories/user.repository');
const UserDTO = require('../dtos/user.dto');
const { generateToken, verifyToken } = require('../utils/jwt');

// ========== REGISTER ==========
exports.showRegister = (req, res) => {
  res.render('register', { title: 'Register', error: null, message: null });
};

exports.register = async (req, res) => {
  try {
    const { nickname, email, password, gender } = req.body;
    if (!nickname || !email || !password) {
      return res
        .status(400)
        .render('register', { title: 'Register', error: 'Nickname, email, and password required.', message: null });
    }

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return res
        .status(409)
        .render('register', { title: 'Register', error: 'Email already registered.', message: null });
    }

    const created = await UserRepository.createUser({ nickname, email, password, gender });
    const token = generateToken({ id: created._id, email: created.email });

    res.cookie('token', token, {
      httpOnly: false, // true in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('/user/profile');
  } catch (err) {
    console.error('Register error:', err);
    res
      .status(500)
      .render('register', { title: 'Register', error: 'Server error during registration.', message: null });
  }
};

// ========== LOGIN ==========
exports.showLogin = (req, res) => {
  res.render('login', { title: 'Login', error: null, message: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password)
      return res.status(400).render('login', { title: 'Login', error: 'Email and password required.', message: null });

    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password)))
      return res
        .status(401)
        .render('login', { title: 'Login', error: 'Invalid email or password.', message: null });

    const token = generateToken({ id: user._id, email: user.email });

    res.cookie('token', token, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('/chat');
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).render('login', { title: 'Login', error: 'Server error during login.', message: null });
  }
};

// ========== LOGOUT ==========
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.render('logout', { title: 'Logged out', message: 'You have been successfully logged out.', error: null });
};

// ========== PROFILE ==========
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).redirect('/user/login');

    const dto = new UserDTO(user);
    res.render('profile', { title: 'Profile', user: dto, error: null, message: null });
  } catch (err) {
    console.error('Profile error:', err);
    res
      .status(500)
      .render('error', { title: 'Error', message: 'Server error retrieving profile.', error: err.message });
  }
};

// ========== API LOGIN (optional for Postman testing) ==========
exports.loginApi = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = generateToken({ id: user._id, email: user.email });
    res.cookie('token', token, { httpOnly: false, maxAge: 24 * 60 * 60 * 1000, sameSite: 'lax' });
    return res.json({ success: true, token, user: new UserDTO(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
