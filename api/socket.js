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

let connections = [];

module.exports = function module(io) {
  io.on('connection', (client) => {
    console.log('connection');

    client.on('initialise room', (data) => {
      console.log('initialise room');
      console.log(data);
      let sharedPrime = genPrime(process.env.MINPRIME, process.env.MAXPRIME);
      let sharedBase = findPrimitiveRoot(sharedPrime);

      connections.push({
        sharedPrime,
        sharedBase
      });

      console.log('response', connections);
      console.log(client.to(data.socketID));

      client.to(data.socketID).emit('initialise response', {
        sharedPrime,
        sharedBase
      });
    });

    client.on('disconnect', () => {
      console.log('disconnect');
    });
  });
};
