const express = require('express');
const router = express.Router();

router.get('/:string', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, collections: { blocks, txs }, config: { latest }, errors } = req.app.locals;

        const string = req.params.string;

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

                res.json({ data: latestBlocks });
                break;
            case 'txs':
                latestTxs = await txs
                    .find({})
                    .project({ _id: 0 })
                    .sort({ time: -1 })
                    .limit(latest)
                    .toArray();

                blockchain.setVoutsSum(latestTxs);

                res.json({ data: latestTxs });
                break;
            default:
                res.status(400).json({ error: errors.invalid_parameter });
                break;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;
