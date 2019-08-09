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
        console.error(error);
        ctx.throw(500);
    }
});

// address txs
router.get('/txs/:address/:skip/:limit', async (ctx) => {
    try {
        const { blockchain, collections: { ios }, errors, config: { limits: { address: allowedLimit } } } = ctx.locals;

        const address = ctx.params.address;
        let skip = ctx.params.skip;
        let limit = ctx.params.limit;

        if (!blockchain.isAddress(address)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_address };
            return false;
        }

        if (!blockchain.isInt(skip) && !blockchain.isInt(limit)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        skip = Number(skip);
        limit = Number(limit);

        limit = (limit >= 1 && limit <= allowedLimit) ? limit : allowedLimit;

        const aggrTotal = ios.aggregate([
            { $match: { address } },
            { $group: { _id: { txid: '$txid' } } }
        ]).toArray();

        const aggrIOs = ios.aggregate([
            { $match: { address } },
            { $group: { _id: { txid: '$txid', time: '$time' }, values: { $push: { type: '$type', value: '$value' } } } },
            { $sort: { '_id.time': -1 } },
            { $skip: skip },
            { $limit: limit }
        ], { allowDiskUse: true }).toArray();

        let [total, txs] = await Promise.all([aggrTotal, aggrIOs]);

        total = total.length;

        txs = txs.map(item => {
            const { type, value } = blockchain.getIOsValuesDiff(item.values);

            return {
                txid: item._id.txid,
                time: item._id.time,
                type,
                value
            };
        });

        if (total === 0) {
            ctx.status = 404;
            ctx.body = { error: errors.address_not_found };
            return false;
        }

        ctx.body = { data: txs, total };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
