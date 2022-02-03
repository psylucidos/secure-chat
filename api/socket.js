function ranBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function isPrime(num) {
  for (let i = 2; i < num; i += 1) {
    if (num % i === 0) {
      return false;
    }
  }

  return num > 1;
}

function genPrime(min, max) {
  let x = 0;
  while (!isPrime(x)) {
    x = ranBetween(min, max);
  }
  return x;
}

function findPrimitiveRoot(k) { // finds primitive root modulo
  const p = 2 * k + 1;

  while (true) { // eslint-disable-line
    const x = ranBetween(1, process.env.MAXPRIMROOT);
    if (x % p !== 1
       && x ** 2 !== 1
       && x ** k !== 1) {
      return x;
    }
  }
}

const rooms = [];

module.exports = function module(io) {
  io.on('connection', (client) => {
    console.log('connection');

    client.on('init room', (data) => {
      console.log('initialise room');
      console.log(data);
      const sharedPrime = genPrime(process.env.MINPRIME, process.env.MAXPRIME);
      const sharedBase = findPrimitiveRoot(sharedPrime);

      client.join(data.roomID);

      rooms.push({
        roomID: data.roomID,
        clients: [data.socketID],
        sharedPrime,
        sharedBase,
        keys: [],
      });

      console.log('new room', rooms[rooms.length - 1]);

      client.emit('init response', {
        sharedPrime,
        sharedBase,
      });
    });

    client.on('join room', (data) => {
      const { roomID } = data;
      console.log('room id given', roomID);

      for (let i = 0; i < rooms.length; i += 1) {
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
      for (let i = 0; i < rooms.length; i += 1) {
        if (rooms[i].roomID === data.roomID) {
          console.log('found room');
          rooms[i].keys.push({
            socketID: data.socketID,
            key: data.key,
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
