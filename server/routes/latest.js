const Router = require('koa-router');
const router = new Router();

router.get('/:string', async (ctx) => {
    try {
        const { blockchain, rpc, collections: { blocks, txs }, config: { limits: { latest } }, errors } = ctx.locals;

        const string = ctx.params.string;

        let latestDbBlocks;
        let latestTxs;

        let latestRpcBlocks;

        switch (string) {
            case 'blocks':
                latestDbBlocks = await blocks
                    .find({})
                    .project({ _id: 0 })
                    .sort({ height: -1 })
                    .limit(latest)
                    .toArray();

                latestRpcBlocks = await Promise.all(latestDbBlocks.map(block => rpc.getBlock([block.hash])));
                latestRpcBlocks = latestRpcBlocks.map(block => block.result);

                ctx.body = { data: latestRpcBlocks };
                break;
            case 'txs':
                latestTxs = await txs
                    .find({})
                    .project({ _id: 0 })
                    .sort({ time: -1 })
                    .limit(latest)
                    .toArray();

                latestTxs = blockchain.setVoutsSum(latestTxs);

                ctx.body = { data: latestTxs };
                break;
            default:
                ctx.status = 400;
                ctx.body = { error: errors.invalid_parameter };
                break;
        }
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
