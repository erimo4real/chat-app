// server.js
const http = require('http');
const app = require('./src/app');
require('dotenv').config();
const connectDB = require('./src/config/db');
const { Server } = require('socket.io');
const { initSocket } = require('./src/utils/socket');

// ====== Connect MongoDB ======
connectDB();

// ====== Create HTTP server ======
const server = http.createServer(app);

// ====== Setup Socket.IO (CORS safe) ======
const io = new Server(server, {
  cors: { origin: true, credentials: true }
});

// ====== Initialize all socket handlers (only once) ======
initSocket(io);

// ====== Start Server ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
