// src/public/js/chat.js
(() => {
  // Prevent creating multiple sockets in the same page context
  if (window.chatSocket && window.chatSocket.connected) {
    console.log('⚠️ chat socket already connected - skipping reinit');
    return;
  }

  // create socket (will send cookies automatically)
  const socket = io({ transports: ['websocket'], withCredentials: true });
  window.chatSocket = socket;

  let currentUserId = null;
  let currentRoom = 'global';
  const seenMessages = new Set();

  document.addEventListener('DOMContentLoaded', () => {
    const messagesEl = document.getElementById('messages');
    const sendForm = document.getElementById('sendForm');
    const inputEl = document.getElementById('messageInput');
    const userList = document.getElementById('userList');

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      // server will emit 'me' and 'room:history' automatically
    });

    socket.on('me', (uid) => {
      currentUserId = uid;
      console.log('🪪 currentUserId:', currentUserId);
      // ensure we are in global room
      socket.emit('room:join', { roomId: currentRoom });
    });

    socket.on('room:history', ({ roomId, messages }) => {
      // only render when we know currentUserId (me)
      currentRoom = roomId;
      messagesEl.innerHTML = '';
      seenMessages.clear();

      const tryRender = () => {
        if (!currentUserId) return setTimeout(tryRender, 100);
        messages.forEach((msg) => {
          if (!seenMessages.has(String(msg._id))) {
            seenMessages.add(String(msg._id));
            renderMessage(msg);
          }
        });
        messagesEl.scrollTop = messagesEl.scrollHeight;
      };
      tryRender();
    });

    socket.on('message:new', (msg) => {
      if (seenMessages.has(String(msg._id))) return;
      seenMessages.add(String(msg._id));
      renderMessage(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });

    socket.on('presence:update', (userIds) => {
      // optional: update sidebar with online users
      if (!userList) return;
      userList.innerHTML = '';
      userIds.forEach((id) => {
        const li = document.createElement('li');
        li.setAttribute('data-userid', id);
        li.className = 'p-2 border-bottom';
        li.textContent = id === currentUserId ? 'You' : `User ${id}`;
        userList.appendChild(li);
      });
    });

    socket.on('dm:invited', ({ from, roomId }) => {
      socket.emit('room:join', { roomId });
    });

    sendForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = inputEl.value.trim();
      if (!content) return;
      socket.emit('message:send', { roomId: currentRoom, content, type: 'text' });
      inputEl.value = '';
    });

    userList?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-userid]');
      if (!target) return;
      const toUserId = target.getAttribute('data-userid');
      if (toUserId && toUserId !== currentUserId) {
        socket.emit('dm:initiate', { toUserId });
      }
    });

    function renderMessage(msg) {
      const senderName = msg.sender?.nickname || msg.sender?.email || 'system';
      const time = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const isMine = msg.sender && String(msg.sender._id) === String(currentUserId);

      const wrapper = document.createElement('div');
      wrapper.dataset.msgid = msg._id;
      wrapper.className = `d-flex mb-2 ${isMine ? 'justify-content-end' : 'justify-content-start'}`;

      const bubble = document.createElement('div');
      bubble.className = `p-2 rounded-3 ${isMine ? 'bg-primary text-white' : 'bg-light text-dark'}`;
      bubble.style.maxWidth = '75%';

      bubble.innerHTML = `
        <div>${escapeHtml(msg.content)}</div>
        <div class="text-end"><small class="text-muted">${isMine ? 'You' : escapeHtml(senderName)} • ${time}</small></div>
      `;

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
    }

    function escapeHtml(s) {
      if (!s) return '';
      return s
        .toString()
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;');
    }
  });
})();
