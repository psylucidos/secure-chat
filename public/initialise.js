/* global io, n, ranBetween */

const socket = io();
var roomID = 0;
var sharedPrime = 0;
var sharedSecret = 0;

let socketID = '';

function initialise() {
  console.log('secret', secret);
  roomID = ranBetween(10000, 1000000);
  socket.emit('init room', {
    socketID,
    roomID,
  });
}

socket.on('connect', () => {
  console.log('connected', socket.id);
  socketID = socket.id;
  initialise();
});

socket.on('init response', (data) => {
  console.log('initialise response');
  console.log(data);
  sharedPrime = data.sharedPrime;

  let x = BigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
  console.log('X', x);
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
