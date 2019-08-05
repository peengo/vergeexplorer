const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { collections: { blocks }, getTxOutSetInfo } = ctx.locals;
        const blocks_db = await blocks.estimatedDocumentCount();

        const info = {
            blocks_db,
            blocks_rpc: getTxOutSetInfo.height,
            transactions: getTxOutSetInfo.transactions,
            moneysupply: getTxOutSetInfo.total_amount
        };

        ctx.body = { data: info };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
