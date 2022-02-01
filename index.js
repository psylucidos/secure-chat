require('dotenv').config();

const hook = require('server-hook');
const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');
const path = require('path');

const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);
const api = require('./api');

require('./api/socket')(io);

app.on('error', (err) => {
  hook.logErr(err);
});

app
  .use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    hook.request(ms);
  })
  .use(cors({
    origin: '*',
  }))
  .use(serve(path.join(__dirname, '/public/')))
  .use(api.middleware());

server.listen(process.env.PORT);
hook.setStatus('Online');

console.log(process.env.HOOKTARGET);

hook.init({
  target: process.env.HOOKTARGET,
  projectName: process.env.HOOKNAME,
  interval: process.env.HOOKINTERVAL,
});
