const express = require('express');
const router = express.Router();

router.get('/:hash', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, rpc, errors } = req.app.locals;

        const hash = req.params.hash;

        if (!blockchain.isHash(hash)) {
            res.status(400).json({ error: errors.not_valid_hash });
            return false;
        }

        const block = await rpc.getBlock(hash);
        
        res.json({ data: block });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

router.get('/txs/:hash/:offset', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const {
            blockchain, collections: { blocks, txs }, errors, config: { limit } } = req.app.locals;

        const hash = req.params.hash;
        let offset = req.params.offset;

        if (!blockchain.isHash(hash)) {
            res.status(400).json({ error: errors.not_valid_hash });
            return false;
        }

        if (!blockchain.isInt(offset)) {
            res.status(400).json({ error: errors.not_valid_int });
            return false;
        }

        offset = Number(offset);

        const block = await blocks.findOne({ hash });

        if (!block) {
            res.status(400).json({ error: errors.block_not_found });
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
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;