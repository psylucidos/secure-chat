/* global io, n */
const MINSECRET = 1000;
const MAXSECRET = 10000;

function cleanBigNumber(x) {
  for (let i = 0; i < x.number.length; i++) {
    total += this.number[x.number.length-(i+1)]
  }
  return total;
};

const socket = io();

let socketID = '';

function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function initialise() {
  let secret = ranBetween(MINSECRET, MAXSECRET);
  // let x = BigNumber(sharedBase).pow(aliceSecret).mod(sharedPrime);
  socket.emit('initialise room', {
    socketID,
  });
}

socket.on('connect', () => {
  console.log('connected', socket.id);
  socketID = socket.id;
  initialise();
});

socket.on('initialise response', (data) => {
  console.log('initialise response');
  console.log(data);
});

socket.on('disconnect', (data) => {
  console.log('disconnected');
  console.log(data);
});
