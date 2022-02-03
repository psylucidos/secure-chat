/* global io, BigNumber, secret */

const socket = io();
let roomID = 0;
let sharedSecret = 0;
let sharedPrime = 0;

let socketID = '';

function join() {
  console.log('my secret', secret);
  roomID = window.location.href.split('?c=')[1]; // eslint-disable-line

  if (roomID) {
    socket.emit('join room', {
      socketID,
      roomID: Number(roomID),
    });
  } else {
    console.log('no room');
  }
}

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socketID = socket.id;
  join();
});

socket.on('room data', (data) => {
  console.log('joined room');
  console.log(data);
  sharedPrime = data.sharedPrime;

  const x = BigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
  console.log('posting key', x);
  socket.emit('post key', {
    socketID,
    key: x,
    roomID: Number(roomID),
  });
});

socket.on('return key', (data) => {
  console.log('key returned');
  console.log(data);
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].socketID !== socketID) {
      console.log(data[i].key, secret, sharedPrime);
      sharedSecret = BigNumber(data[i].key).pow(secret).mod(sharedPrime).clean();
      console.log('shared secret', sharedSecret);
    }
  }
});

socket.on('disconnect', (data) => {
  console.log('disconnected');
  console.log(data);
});
