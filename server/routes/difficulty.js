const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc } = ctx.locals;

        let { result: difficulty } = await rpc.getDifficulty();

        ctx.body = { data: { difficulty } };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
