// Load environment variables first
require('dotenv').config();

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// ===== View engine setup =====
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// ===== Routes =====
const testRoutes = require('./routes/test.route');
app.use('/', testRoutes);

const authRoutes = require('./routes/auth.route');
app.use('/auth', authRoutes);


// Health check route (optional but useful)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running fine' });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - Page Not Found' });
});

module.exports = app;
