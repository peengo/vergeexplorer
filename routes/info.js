const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { collections: { blocks }, rpc } = req.app.locals;

        let info = await rpc.getInfo();
        const blocks_db = await blocks.estimatedDocumentCount();

        info = {
            blocks_db,
            blocks_rpc: info.blocks,
            moneysupply: info.moneysupply,
            paytxfee: info.paytxfee
        }

        res.json({ data: info });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;