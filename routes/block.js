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

        const { result: block, error } = await rpc.getblock([hash]);

        if (error) {
            res.status(404).json({ error: error.message });
            return false;
        }

        res.json({ data: block });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

router.get('/txs/:hash/:offset', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, collections: { blocks, txs }, errors, config: { limit } } = req.app.locals;

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
            res.json({ error: errors.block_not_found });
            return false;
        }

        const txids = block.tx;

        const [total, transactions] = await Promise.all([
            txs.find({ txid: { $in: txids } }).count(),
            txs
                .find({ txid: { $in: txids } })
                .project({ _id: 0 })
                .sort({ time: -1 })
                .skip(offset)
                .limit(limit)
                .toArray()
        ]);

        blockchain.setVoutsSum(transactions);

        res.json({ data: transactions, total });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;