// src/utils/socket.js
const cookie = require('cookie');
const MessageRepository = require('../repositories/message.repository');
const UserRepository = require('../repositories/user.repository');
const { verifyToken } = require('./jwt');

const onlineUsers = new Map(); // userId -> [socketIds...]

function ensureArray(v) {
  return v ? (Array.isArray(v) ? v : [v]) : [];
}

function makeDMRoomId(a, b) {
  const [x, y] = [a.toString(), b.toString()].sort();
  return `dm:${x}-${y}`;
}

async function attachSocketHandlers(io) {
  // Middleware: authenticate socket using cookie JWT
  io.use(async (socket, next) => {
    try {
      const headersCookie = socket.handshake.headers.cookie || '';
      const cookies = cookie.parse(headersCookie);
      const token = cookies.token || (socket.handshake.auth && socket.handshake.auth.token);
      if (!token) return next(new Error('No token'));

      const decoded = verifyToken(token);
      if (!decoded) return next(new Error('Invalid token'));

      const user = await UserRepository.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = {
        id: user._id.toString(),
        nickname: user.nickname,
        email: user.email,
      };

      return next();
    } catch (err) {
      console.error('Socket auth error:', err && err.message ? err.message : err);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const uid = socket.user.id;
    console.log(`✅ New user connected: ${socket.user.nickname} (${socket.id})`);

    // track sockets per user (tabs)
    const list = ensureArray(onlineUsers.get(uid));
    list.push(socket.id);
    onlineUsers.set(uid, list);

    // join user-specific room and global
    socket.join(`user:${uid}`);
    const globalRoom = 'global';
    socket.join(globalRoom);

    // send the client's own id immediately
    socket.emit('me', uid);

    // send recent global history
    MessageRepository.getLastMessages(globalRoom, 100)
      .then((msgs) => socket.emit('room:history', { roomId: globalRoom, messages: msgs.reverse() }))
      .catch((e) => console.error('history error', e));

    // update presence to everyone
    io.emit('presence:update', Array.from(onlineUsers.keys()));

    // handle joining arbitrary rooms
    socket.on('room:join', async ({ roomId }) => {
      socket.join(roomId);
      const msgs = await MessageRepository.getLastMessages(roomId, 100);
      socket.emit('room:history', { roomId, messages: msgs.reverse() });
    });

    // DM initiate (invite recipient)
    socket.on('dm:initiate', async ({ toUserId }) => {
      const roomId = makeDMRoomId(uid, toUserId);
      socket.join(roomId);
      const msgs = await MessageRepository.getLastMessages(roomId, 100);
      socket.emit('room:history', { roomId, messages: msgs.reverse() });

      // notify recipient sockets
      const sockets = ensureArray(onlineUsers.get(toUserId));
      sockets.forEach((sid) => {
        const s = io.sockets.sockets.get(sid);
        if (s) s.emit('dm:invited', { from: socket.user, roomId });
      });
    });

    // handle message send
    socket.on('message:send', async ({ roomId, content, type = 'text', meta }) => {
      try {
        const saved = await MessageRepository.saveMessage({
          roomId,
          sender: uid,
          content,
          type,
          meta: meta || {},
        });

        // populate sender for client
        const populated = await saved.populate('sender', 'nickname email');
        // broadcast authoritative message to room
        io.to(roomId).emit('message:new', populated);
      } catch (err) {
        console.error('message save error:', err);
        socket.emit('message:error', { message: 'Failed to send message' });
      }
    });

    // cleanup on disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.nickname} (${socket.id})`);
      const arr = ensureArray(onlineUsers.get(uid)).filter((sid) => sid !== socket.id);
      if (arr.length) onlineUsers.set(uid, arr);
      else onlineUsers.delete(uid);
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    });
  });
}

function initSocket(ioOrServer) {
  if (ioOrServer && typeof ioOrServer.on === 'function' && ioOrServer.engine) {
    attachSocketHandlers(ioOrServer);
  } else {
    const { Server } = require('socket.io');
    const io = new Server(ioOrServer, { cors: { origin: true, credentials: true } });
    attachSocketHandlers(io);
  }
}

module.exports = { initSocket };
