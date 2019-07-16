const Router = require('koa-router');
const router = new Router();

// address info
router.get('/:address', async (ctx) => {
    try {
        const { blockchain, collections: { addresses }, errors } = ctx.locals;

        const address = ctx.params.address;

        if (!blockchain.isAddress(address)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_address };
            return false;
        }

        const addr = await addresses
            .findOne({ address }, { projection: { _id: 0 } });

        if (!addr) {
            ctx.status = 404;
            ctx.body = { error: errors.address_not_found };
            return false;
        }

        ctx.body = { data: addr };
    } catch (error) {
        throw new Error(error);
    }
});

// address txs
router.get('/txs/:address/:offset', async (ctx) => {
    try {
        const { blockchain, collections: { ios }, errors, config: { limit } } = ctx.locals;

        const address = ctx.params.address;
        let offset = ctx.params.offset;

        if (!blockchain.isAddress(address)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_address };
            return false;
        }

        if (!blockchain.isInt(offset)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        offset = Number(offset);

        const [total, txs] = await Promise.all([
            ios.find({ address }).count(),
            ios
                .find({ address })
                .project({ _id: 0, address: 0 })
                .sort({ time: -1, type: -1 })
                .skip(offset)
                .limit(limit)
                .toArray()
        ]);

        if (total === 0) {
            ctx.status = 404;
            ctx.body = { error: errors.address_not_found };
            return false;
        }

        // TODO template logic

        ctx.body = { data: txs, total };
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = router;
