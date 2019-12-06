const Router = require('koa-router');
const router = new Router();

router.get('/blocks', async (ctx) => {
    try {
        const { rpc, collections: { blocks }, config: { limits: { latest } } } = ctx.locals;

        let latestDbBlocks, latestRpcBlocks;

        latestDbBlocks = await blocks
            .find({})
            .project({ _id: 0 })
            .sort({ height: -1 })
            .limit(latest)
            .toArray();

        latestRpcBlocks = await Promise.all(latestDbBlocks.map(block => rpc.getBlock([block.hash])));
        latestRpcBlocks = latestRpcBlocks.map(block => block.result);

        ctx.body = { data: latestRpcBlocks };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

router.get('/txs', async (ctx) => {
    try {
        const { blockchain, collections: { txs }, config: { limits: { latest } } } = ctx.locals;

        let latestTxs;

        latestTxs = await txs
            .find({})
            .project({ _id: 0 })
            .sort({ time: -1 })
            .limit(latest)
            .toArray();

        latestTxs = blockchain.setVoutsSum(latestTxs);

        ctx.body = { data: latestTxs };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
