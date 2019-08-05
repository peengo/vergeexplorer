const Router = require('koa-router');
const router = new Router();

router.get('/:hash', async (ctx) => {
    try {
        const { blockchain, rpc, errors } = ctx.locals;

        const hash = ctx.params.hash;

        if (!blockchain.isHash(hash)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_hash };
            return false;
        }

        const { result: block, error } = await rpc.getBlock([hash]);

        if (error) {
            ctx.status = 404;
            ctx.body = { error: error.message };
            return false;
        }

        ctx.body = { data: block };
    } catch (error) {
        if (error.data.error.code && error.data.error.message) {
            if (error.data.error.code == -5) {
                ctx.throw(404, error.data.error.message);
            } else {
                ctx.throw(error.status, error.data.error.message);
            }
        } else {
            // console.error(error.status);
            ctx.throw(500);
        }
    }
});

router.get('/txs/:hash/:offset', async (ctx) => {
    try {
        const { blockchain, collections: { blocks, txs }, errors, config: { limit } } = ctx.locals;

        const hash = ctx.params.hash;
        let offset = ctx.params.offset;

        if (!blockchain.isHash(hash)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_hash };
            return false;
        }

        if (!blockchain.isInt(offset)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        offset = Number(offset);

        const block = await blocks.findOne({ hash });

        if (!block) {
            ctx.status = 404;
            ctx.body = { error: errors.block_not_found };
            return false;
        }

        const txids = block.tx;

        let [total, transactions] = await Promise.all([
            txs.find({ txid: { $in: txids } }).count(),
            txs
                .find({ txid: { $in: txids } })
                .project({ _id: 0 })
                .sort({ time: -1 })
                .skip(offset)
                .limit(limit)
                .toArray()
        ]);

        transactions = blockchain.setVoutsSum(transactions);

        ctx.body = { data: transactions, total };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
