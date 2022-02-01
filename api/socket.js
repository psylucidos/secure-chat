module.exports = function module(io) {
  io.on('connection', (client) => {
    console.log('connection');
    client.on('handshake', (data) => {
      console.log('event');
      console.log(data);
    });
    client.on('disconnect', () => {
      console.log('disconnect');
    });
  });
};
