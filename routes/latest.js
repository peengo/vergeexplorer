const Router = require('koa-router');
const router = new Router();

router.get('/:string', async (ctx) => {
    try {
        const { blockchain, collections: { blocks, txs }, config: { latest }, errors } = ctx.locals;

        const string = ctx.params.string;

        let latestBlocks;
        let latestTxs;

        switch (string) {
            case 'blocks':
                latestBlocks = await blocks
                    .find({})
                    .project({ _id: 0 })
                    .sort({ height: -1 })
                    .limit(latest)
                    .toArray();

                ctx.body = { data: latestBlocks };
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
        throw new Error(error);
    }
});

module.exports = router;
