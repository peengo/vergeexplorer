const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc } = ctx.locals;
        
        const { result: mempool, error: mempoolError} = await rpc.getRawMempool();

        if (mempoolError) throw mempoolError;

        ctx.body = { data: mempool };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
