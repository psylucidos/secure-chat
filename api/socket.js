function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function isPrime(num) {
  for(let i = 2; i < num; i++)
    if(num % i === 0) return false;
  return num > 1;
}

function genPrime(min, max) {
  while (true) {
    let x = ranBetween(min, max);
    if (isPrime(x)) {
      return x;
    }
  }
}

function findPrimitiveRoot(k) { // finds primitive root modulo
  let p = 2*k + 1;

  while(true) {
    x = ranBetween(1, 1000);
    if(x %p != 1 &&
       x**2 != 1 &&
       x**k != 1) {
      return x;
    }
  }
}

let rooms = [];

module.exports = function module(io) {
  io.on('connection', (client) => {
    console.log('connection');

    client.on('init room', (data) => {
      console.log('initialise room');
      console.log(data);
      let sharedPrime = genPrime(process.env.MINPRIME, process.env.MAXPRIME);
      let sharedBase = findPrimitiveRoot(sharedPrime);

      rooms.push({
        roomID: data.roomID,
        clients: [data.socketID],
        sharedPrime,
        sharedBase,
        keys: [],
      });

      client.join(data.roomID);

      console.log('new room', rooms[rooms.length - 1]);

      client.emit('init response', {
        sharedPrime,
        sharedBase
      });
    });

    client.on('join room', (data) => {
      const roomID = data.roomID;
      console.log('room id given', roomID);

      for (let i = 0; i < rooms.length; i++) {
        console.log('room', rooms[i].roomID);
        if (rooms[i].roomID === roomID && rooms[i].clients.length === 1) {
          console.log('joined');
          client.join(roomID);
          client.emit('room data', rooms[i]);
          rooms[i].clients.push(data.socketID);
          return;
        }
      }

      client.emit('room data', false);
    });

    client.on('post key', (data) => {
      console.log('recieved post key', data);
      for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].roomID === data.roomID) {
          console.log('found room');
          rooms[i].keys.push({
            socketID: data.socketID,
            key: data.key
          });
          if (rooms[i].keys.length === 2) {
            console.log('returning keys');
            io.to(rooms[i].roomID).emit('return key', rooms[i].keys);
          }
        }
      }
    });

    client.on('disconnect', () => {
      console.log('disconnect');
    });
  });
};
