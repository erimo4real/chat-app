
// Connect to Socket.IO
const socket = io();

// Confirm socket connection in browser console
socket.on('connect', () => {
  console.log('🟢 Connected to server with ID:', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔴 Disconnected from server');
});
