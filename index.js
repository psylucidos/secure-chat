require('dotenv').config();

const hook = require('server-hook');
const Koa = require('koa');
const serve = require('koa-static');
const cors = require('@koa/cors');
const path = require('path');

const app = new Koa();
const api = require('./api');

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

app.listen(process.env.PORT);
hook.setStatus('Online');

hook.init({
  target: process.env.HOOKTARGET,
  projectName: process.env.HOOKNAME,
  interval: process.env.HOOKINTERVAL,
})
