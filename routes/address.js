const express = require('express');
const router = express.Router();

// address info
router.get('/:address', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, collections: { addresses }, errors } = req.app.locals;

        const address = req.params.address;

        if (!blockchain.isAddress(address)) {
            res.status(400).json({ error: errors.not_valid_address });
            return false;
        }

        const addr = await addresses
            .findOne({ address }, { projection: { _id: 0 } });

        if (!addr) {
            res.json({ error: errors.address_not_found });
            return false;
        }

        res.json({ data: addr });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

// address txs
router.get('/txs/:address/:offset', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, collections: { address_txs }, errors, config: { limit } } = req.app.locals;

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

        const [total, txs] = await Promise.all([
            address_txs.find({ address }).count(),
            address_txs
                .find({ address })
                .project({ _id: 0, address: 0 })
                .sort({ time: -1, type: -1 })
                .skip(offset)
                .limit(limit)
                .toArray()
        ]);

        if (total === 0) {
            res.json({ error: errors.address_not_found });
            return false;
        }

        // TODO template logic

        res.json({ data: txs, total });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;