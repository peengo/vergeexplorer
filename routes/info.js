const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { db, rpc, statuses, config: { col } } = req.app.locals;

    try {
        let info = await rpc.getInfo();
        const blocks_db = await db.collection(col.blocks).estimatedDocumentCount();

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