/* global io, BigNumber, ranBetween, secret */

const socket = io();
let roomID = 0;
let sharedPrime = 0;
let sharedSecret = 0;

let socketID = '';

function initialise() {
  console.log('my secret', secret);
  roomID = ranBetween(10000, 1000000);
  socket.emit('init room', {
    socketID,
    roomID,
  });
}

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socketID = socket.id;
  initialise();
});

socket.on('init response', (data) => {
  console.log('initialisation response');
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
      sharedSecret = BigNumber(data[i].key).pow(secret).mod(sharedPrime).clean();
      console.log('shared secret', sharedSecret);
    }
  }
});

socket.on('disconnect', (data) => {
  console.log('disconnected');
  console.log(data);
});
