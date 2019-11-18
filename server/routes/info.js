const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { collections: { blocks }, getTxOutSetInfo, rpc } = ctx.locals;

        const [ blocks_db, {result: networkInfo, error: networkInfoError }] = await Promise.all([
            blocks.estimatedDocumentCount(),
            rpc.getNetworkInfo()
        ]);

        if (networkInfoError) throw networkInfoError;

        const info = {
            blocks_db,
            blocks_rpc: getTxOutSetInfo.height,
            transactions: getTxOutSetInfo.transactions,
            moneysupply: getTxOutSetInfo.total_amount,
            subversion: networkInfo.subversion
        };

        ctx.body = { data: info };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
