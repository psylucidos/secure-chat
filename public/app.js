/* global io */

require('@fortawesome/fontawesome-free/js/all'); // load in font-awesome icons
const crypto = require('crypto');
const bigNumber = require('big-number');

const socket = io();
const MINSECRET = 1000;
const MAXSECRET = 10000;
let roomID = 0;
let sharedPrime = 0;
let sharedSecret = 0;
let sharedKey = '';

bigNumber.prototype.clean = function clean() {
  let total = '';
  for (let i = 0; i < this.number.length; i += 1) {
    total += this.number[this.number.length - (i + 1)];
  }
  return total;
};

function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const secret = ranBetween(MINSECRET, MAXSECRET);

let socketID = '';

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function decrypt(text, key) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

function initialise() {
  document.getElementById('chat-input').disabled = true;
  document.getElementById('connect-form').style.display = 'none';
  document.getElementById('chat').style.display = 'inline-block';
  console.log('my secret', secret);
  roomID = ranBetween(10000, 1000000);
  console.log('room id', roomID);
  document.getElementById('room-code-text').innerHTML = roomID;

  socket.emit('init room', {
    socketID,
    roomID,
  });

  socket.on('init response', (data) => {
    console.log('initialisation response');
    console.log(data);
    sharedPrime = data.sharedPrime;

    const x = bigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
    console.log('posting key', x);
    socket.emit('post key', {
      socketID,
      key: x,
      roomID: Number(roomID),
    });
  });
}

function join() {
  document.getElementById('chat-input').disabled = true;
  document.getElementById('connect-form').style.display = 'none';
  document.getElementById('chat').style.display = 'inline-block';
  console.log('my secret', secret);
  roomID = Number(document.getElementById('room-code-input').value);

  if (roomID) {
    socket.emit('join room', {
      socketID,
      roomID: Number(roomID),
    });
  } else {
    console.log('no room found');
    return;
  }

  socket.on('room data', (data) => {
    console.log('joined room', roomID);
    console.log(data);
    document.getElementById('room-code-text').innerHTML = data.roomID;
    if (!data) {
      console.log('room dont exist');
      return;
    }
    sharedPrime = data.sharedPrime;

    const x = bigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
    console.log('posting key', x);
    socket.emit('post key', {
      socketID,
      key: x,
      roomID: Number(roomID),
    });
  });
}

function message() {
  let text = document.getElementById('chat-input').value;
  text = encrypt(text, sharedKey);
  console.log('sending message', text);
  document.getElementById('chat-input').value = '';

  socket.emit('message', {
    socketID,
    roomID,
    text,
  });
}

socket.on('message', (data) => {
  console.log('incoming message', data);
  const text = `${data.socketID}: ${decrypt(data.text, sharedKey)}`;
  const chat = document.getElementById('chat-box');
  const p = document.createElement('p');
  chat.append(text, p);
});

socket.on('return key', (data) => {
  console.log('key returned');
  console.log(data);
  for (let i = 0; i < data.length; i += 1) {
    if (data[i].socketID !== socketID) {
      sharedSecret = bigNumber(data[i].key).pow(secret).mod(sharedPrime).clean();
      sharedKey = crypto.createHash('md5').update(String(sharedSecret)).digest('hex');
      document.getElementById('chat-input').disabled = false;
      console.log('shared secret', sharedKey);
    }
  }
});

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socketID = socket.id;
});

socket.on('disconnect', (data) => {
  console.log('disconnected');
  console.log(data);
});

document.getElementById('create-room-btn').addEventListener('click', initialise);
document.getElementById('join-room-btn').addEventListener('click', join);
document.getElementById('chat-input').addEventListener('keyup', (event) => {
  if (event.keyCode === 13) {
    message();
  }
});
