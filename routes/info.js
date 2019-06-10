const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { collections: { blocks }, getTxOutSetInfo, price } = req.app.locals;
        const blocks_db = await blocks.estimatedDocumentCount();

        const info = {
            blocks_db,
            blocks_rpc: getTxOutSetInfo.height,
            transactions: getTxOutSetInfo.transactions,
            moneysupply: getTxOutSetInfo.total_amount,
            price
        };

        res.json({ data: info });
    } catch (error) {
        console.error(error.message);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;
