const express = require('express');
const router = express.Router();

router.get('/:hash', async (req, res) => {
    const { blockchain, rpc, statuses, errors } = req.app.locals;

    try {
        const hash = req.params.hash;

        if (!blockchain.isHash(hash)) {
            res.json({ error: errors.not_valid_hash });
            return false;
        }

        const block = await rpc.getBlock(hash);
        res.json({ data: block });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

router.get('/txs/:hash/:offset', async (req, res) => {
    const { blockchain, db, statuses, errors, config: { col, limit } } = req.app.locals;

    try {
        const hash = req.params.hash;
        let offset = req.params.offset;

        if (!blockchain.isHash(hash)) {
            res.json({ error: errors.not_valid_hash });
            return false;
        }

        if (!blockchain.isSafePositiveInt(offset)) {
            res.json({ error: errors.not_valid_int });
            return false;
        }

        offset = Number(offset);
        const blocks = db.collection(col.blocks);
        const txs = db.collection(col.txs);

        const block = await blocks.findOne({ hash });

        if (!block) {
            res.json({ error: errors.block_not_found });
            return false;
        }

        console.log('offset:', offset, typeof offset);

        const txids = block.tx;
        const total = await txs.find({ txid: { $in: txids } }).count();
        const transactions = await txs
            .find({ txid: { $in: txids } })
            .project({ _id: 0 })
            .sort({ time: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        blockchain.setVoutsSum(transactions);

        // const getAllPagesFetched = (offset, count) => {
        //     let all;
        //     (offset >= count - limit) ? all = true : all = false;
        //     return all;
        // }

        // const all = getAllPagesFetched(offset, count);

        res.json({ data: transactions, total });

    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;