const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc } = ctx.locals;

        let { result: peers } = await rpc.getPeerInfo();

        ctx.body = { data: peers };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
