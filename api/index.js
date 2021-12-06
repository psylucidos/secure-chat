const Router = require('koa-joi-router');

const router = new Router();
const { Joi } = Router;

router.prefix('/api');

router.route({
  method: 'get',
  path: '/',
  handler: async (ctx) => {
    ctx.body = "Pong!";
    ctx.status = 200;
  },
});

module.exports = router;
