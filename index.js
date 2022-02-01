require('dotenv').config();

const Koa = require('koa');
const serve = require('koa-static');
const hook = require('server-hook');
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
    console.log(ctx.path);
    await next();
  })
  .use(async (ctx, next) => {
    // if request is for a page (not css/js file)
    if (ctx.path.includes('.html') || ctx.path[ctx.path.length - 1] === '/') {
      // record response time
      const start = Date.now();
      await next();
      const ms = Date.now() - start;
      hook.request(ms); // update hook
    } else {
      await next();
    }
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
