/* global io */
const socket = io();

socket.on('connect', () => {
  console.log('connected', socket.id);

  socket.emit('handshake', 293);
});

socket.on('disconnect', () => {
  console.log('disconnected');
});
