// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/jwt');
const UserRepository = require('../repositories/user.repository');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      console.warn('No token found in cookies or headers');
      return res.redirect('/user/login');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.warn('Token verification failed or expired');
      res.clearCookie('token');
      return res.redirect('/user/login');
    }

    const user = await UserRepository.findById(decoded.id);
    if (!user) {
      console.warn('User not found for decoded token');
      res.clearCookie('token');
      return res.redirect('/user/login');
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.clearCookie('token');
    return res.redirect('/user/login');
  }
};
