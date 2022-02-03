/* global io, n, secret */

const socket = io();
var roomID = 0;
var sharedSecret = 0;
var sharedPrime = 0;

let socketID = '';

function join() {
  console.log('my secret', secret);
  roomID = window.location.href.split("?c=")[1];

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

  let x = BigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
  console.log('posting key', x);
  socket.emit('post key', {
    socketID,
    key: x,
    roomID: Number(roomID)
  });
});

socket.on('return key', (data) => {
  console.log('key returned');
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    if(data[i].socketID !== socketID) {
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
