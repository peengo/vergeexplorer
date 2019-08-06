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

        // const [total, txs] = await Promise.all([
        //     ios.find({ address }).count(),
        //     ios
        //         .find({ address })
        //         .project({ _id: 0, address: 0 })
        //         .sort({ time: -1, type: -1 })
        //         .skip(offset)
        //         .limit(limit)
        //         .toArray()
        // ]);

        const aggrTotal = ios.aggregate([
            { $match: { address } },
            { $group: { _id: { txid: '$txid', time: '$time' }, values: { $push: { type: '$type', value: '$value' } } } }
        ]).toArray();

        const aggrIOs = ios.aggregate([
            { $match: { address } },
            { $group: { _id: { txid: '$txid', time: '$time' }, values: { $push: { type: '$type', value: '$value' } } } },
            { $sort: { '_id.time': -1 } },
            { $skip: offset },
            { $limit: limit }
        ]).toArray();

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

        console.log(total);

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
