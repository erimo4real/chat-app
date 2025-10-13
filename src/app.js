const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const testRoutes = require('./routes/test.route');
const userRoutes = require('./routes/user.route');

app.use('/', testRoutes);
app.use('/user', userRoutes);

app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', { title: 'Not Found', message: `Route not found: ${req.originalUrl}` });
  }
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
