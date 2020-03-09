const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc } = ctx.locals;

        let { result: blockCount, error: blockCountError } = await rpc.getBlockCount();

        if (blockCountError) throw blockCountError;

        ctx.body = { data: { blockcount: blockCount } };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
