const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { collections: { blocks }, rpc, price } = req.app.locals;

        let [{ result: info }, blocks_db] = await Promise.all([
            rpc.getinfo(),
            await blocks.estimatedDocumentCount()
        ]);

        info = {
            blocks_db,
            blocks_rpc: info.blocks,
            moneysupply: info.moneysupply,
            paytxfee: info.paytxfee,
            price
        };

        res.json({ data: info });
    } catch (error) {
        console.error(error.message);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;
