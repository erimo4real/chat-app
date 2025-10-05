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
  console.log('ðŸŸ¢ New user connected:', socket.id);
  socket.on('disconnect', () => console.log('ðŸ”´ User disconnected:', socket.id));
});

// ====== Start Server ======
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
});
