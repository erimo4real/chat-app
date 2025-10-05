param (
    [string]$projectName = "chat-app"
)

$ErrorActionPreference = "Stop"

Write-Host "Creating project folder: $projectName" -ForegroundColor Cyan
if (-not (Test-Path $projectName)) {
    New-Item -ItemType Directory -Force -Path $projectName | Out-Null
}
Set-Location $projectName

# Initialize Git and npm
if (-not (Test-Path ".git")) { git init | Out-Null }
if (-not (Test-Path "package.json")) { npm init -y | Out-Null }

# .gitignore
@"
node_modules
.env
src/public/uploads
"@ | Out-File -Encoding UTF8 ".gitignore"

# .env.example
@"
PORT=3000
MONGO_URI=mongodb://localhost:27017/chat_app
JWT_SECRET=supersecretkey
UPLOAD_DIR=./src/public/uploads
"@ | Out-File -Encoding UTF8 ".env.example"

# README
@"
# Chat App (Stage 0)
Basic project setup with Express, EJS, MongoDB, Socket.IO, JWT, and Docker support.
"@ | Out-File -Encoding UTF8 "README.md"

# Folder structure
$folders = @(
    "src",
    "src/config",
    "src/controllers",
    "src/repositories",
    "src/models",
    "src/dtos",
    "src/routes",
    "src/middleware",
    "src/views",
    "src/views/partials",
    "src/public",
    "src/public/css",
    "src/public/js",
    "src/public/uploads",
    "src/utils",
    "src/tests"
)

foreach ($f in $folders) {
    if (-not (Test-Path $f)) { New-Item -ItemType Directory -Force -Path $f | Out-Null }
}

# User model
@"
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
"@ | Out-File -Encoding UTF8 "src/models/user.model.js"

# db.js
@"
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chat_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
"@ | Out-File -Encoding UTF8 "src/config/db.js"

# Controller
@"
exports.getTest = (req, res) => {
  res.render('index', { title: 'Chat App Stage 0', message: 'Server is running ✅' });
};
"@ | Out-File -Encoding UTF8 "src/controllers/test.controller.js"

# Route
@"
const express = require('express');
const router = express.Router();
const controller = require('../controllers/test.controller');

router.get('/', controller.getTest);

module.exports = router;
"@ | Out-File -Encoding UTF8 "src/routes/test.route.js"

# app.js
@"
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// routes
const testRoutes = require('./routes/test.route');
app.use('/', testRoutes);

module.exports = app;
"@ | Out-File -Encoding UTF8 "src/app.js"

# server.js
@"
const http = require('http');
const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');

// connect MongoDB
connectDB();

// create server
const server = http.createServer(app);

// setup socket.io
const io = new Server(server);
io.on('connection', (socket) => {
  console.log('🟢 New user connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 User disconnected:', socket.id));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
"@ | Out-File -Encoding UTF8 "server.js"

# Views
@"
<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8'>
  <meta name='viewport' content='width=device-width, initial-scale=1'>
  <title><%= title %></title>
  <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css' rel='stylesheet'>
  <link rel='stylesheet' href='/css/style.css'>
</head>
<body>
  <%- include('partials/navbar') %>
  <div class='container mt-5'>
    <%- body %>
  </div>
  <script src='/socket.io/socket.io.js'></script>
  <script src='/js/main.js'></script>
</body>
</html>
"@ | Out-File -Encoding UTF8 "src/views/layout.ejs"

@"
<% layout('layout') -%>
<h1 class='text-center'><%= message %></h1>
"@ | Out-File -Encoding UTF8 "src/views/index.ejs"

@"
<nav class='navbar navbar-dark bg-dark'>
  <div class='container-fluid'>
    <a class='navbar-brand' href='/'>ChatApp</a>
  </div>
</nav>
"@ | Out-File -Encoding UTF8 "src/views/partials/navbar.ejs"

# CSS / JS
"body { background-color: #f8f9fa; }" | Out-File -Encoding UTF8 "src/public/css/style.css"
"const socket = io(); console.log('Connected to Socket.IO');" | Out-File -Encoding UTF8 "src/public/js/main.js"

# Logger utility
"module.exports = { info: (...args) => console.log('[INFO]', ...args) };" | Out-File -Encoding UTF8 "src/utils/logger.js"

# Docker
@"
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD [""npm"", ""run"", ""start""]
"@ | Out-File -Encoding UTF8 "Dockerfile"

@"
version: '3'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongo
  mongo:
    image: mongo
    restart: always
    ports:
      - '27017:27017'
"@ | Out-File -Encoding UTF8 "docker-compose.yml"

# Install dependencies
Write-Host "`nInstalling Node dependencies..." -ForegroundColor Yellow
npm install express ejs mongoose socket.io multer jsonwebtoken bcrypt dotenv morgan cors --save
npm install nodemon --save-dev

# Fix JSON script issue
$packageJsonPath = ".\package.json"
Write-Host "`nUpdating package.json scripts..." -ForegroundColor Yellow
$pkg = Get-Content $packageJsonPath -Raw | ConvertFrom-Json
$pkg.scripts = @{
    start = "node server.js"
    dev   = "nodemon server.js"
}
$pkg | ConvertTo-Json -Depth 10 | Set-Content -Path $packageJsonPath -Encoding UTF8

Write-Host "✅ Scripts added successfully to package.json" -ForegroundColor Green
Write-Host "`n🎯 Stage 0 setup complete! Run 'npm run dev' to start your server." -ForegroundColor Cyan
