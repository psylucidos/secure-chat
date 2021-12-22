const Router = require('koa-joi-router');

const router = new Router();
// const { Joi } = Router;

router.prefix('/api');

router.get('/', async (ctx) => {
  ctx.status = 200;
  ctx.body = 'hello world';
});

module.exports = router;
