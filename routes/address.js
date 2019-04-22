const express = require('express');
const router = express.Router();

// address info
router.get('/:address', async (req, res) => {
    const { blockchain, db, statuses, errors, config: { col } } = req.app.locals;

    try {
        const address = req.params.address;

        if (!blockchain.isAddress(address)) {
            res.status(400).json({ error: errors.not_valid_address });
            return false;
        }

        const addr = await db.collection(col.addresses)
            .findOne({ address }, { projection: { _id: 0 } });

        if (!addr) {
            res.status(400).json({ error: errors.address_not_found });
            return false;
        }

        res.json({ data: addr });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

// address txs
router.get('/txs/:address/:offset', async (req, res) => {
    const { blockchain, db, statuses, errors, config: { col, limit } } = req.app.locals;

    try {
        const address = req.params.address;
        let offset = req.params.offset;

        if (!blockchain.isAddress(address)) {
            res.status(400).json({ error: errors.not_valid_address });
            return false;
        }

        if (!blockchain.isInt(offset)) {
            res.status(400).json({ error: errors.not_valid_int });
            return false;
        }

        offset = Number(offset);

        const address_txs = db.collection(col.address_txs);
        const total = await address_txs.find({ address }).count();
        const txs = await address_txs.find({ address })
            .project({ _id: 0, address: 0 })
            .sort({ time: -1, type: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        // TODO template logic

        res.json({ data: txs, total });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;