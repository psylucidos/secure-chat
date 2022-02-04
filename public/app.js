/* global io, BigNumber, ranBetween, secret */

const socket = io();
let roomID = 0;
let sharedPrime = 0;
let sharedSecret = 0;

let socketID = '';

// var encrypted = CryptoJS.AES.encrypt("Message", "SecretPassphrase");
//
// var decrypted = CryptoJS.AES.decrypt(encrypted, "SecretPassphrase");
//
// console.log(encrypted, decrypted);

function initialise() {
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

    const x = BigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
    console.log('posting key', x);
    socket.emit('post key', {
      socketID,
      key: x,
      roomID: Number(roomID),
    });
  });
}

function join() {
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
    if (!data) {
      console.log('room dont exist');
      return;
    }
    sharedPrime = data.sharedPrime;

    const x = BigNumber(data.sharedBase).pow(secret).mod(data.sharedPrime).clean();
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
  text = CryptoJS.AES.encrypt(text, String(sharedSecret)).toString();
  console.log('sending message', text);
  document.getElementById('chat-input').value = "";

  socket.emit('message', {
    socketID,
    roomID,
    text,
  });
}

document.getElementById('chat-input').addEventListener('keyup', function(event) {
  if (event.keyCode === 13) {
  	message();
  }
});

socket.on('message', (data) => {
  console.log('incoming message', data);
  var decrypted = CryptoJS.AES.decrypt(data.text, String(sharedSecret)).toString();
  let chat = document.getElementById('chat-box');
  let p = document.createElement('p');
  chat.append(decrypted, p);
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

socket.on('connect', () => {
  console.log('connected as', socket.id);
  socketID = socket.id;
  // initialise();
});

socket.on('disconnect', (data) => {
  console.log('disconnected');
  console.log(data);
});
