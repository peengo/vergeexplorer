const express = require('express');
const router = express.Router();

router.get('/:string', async (req, res) => {
    const { blockchain, db, statuses, config: { col, latest } } = req.app.locals;

    try {
        const string = req.params.string;

        switch (string) {
            case 'blocks':
                const blocks = await db.collection(col.blocks)
                    .find({})
                    .project({ _id: 0 })
                    .sort({ height: -1 })
                    .limit(latest)
                    .toArray();

                res.json({ data: blocks });
                break;
            case 'txs':
                const txs = await db.collection(col.txs)
                    .find({})
                    .project({ _id: 0 })
                    .sort({ time: -1 })
                    .limit(latest)
                    .toArray();

                blockchain.setVoutsSum(txs);

                res.json({ data: txs });
                break;
            default:
                res.status(404).json(statuses[404]);
                break;
        }
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;