const express = require('express');
const router = express.Router();

router.get('/:txid', async (req, res) => {
    const { blockchain, db, rpc, statuses, errors, config: { col } } = req.app.locals;

    try {
        const txid = req.params.txid;

        if (!blockchain.isHash(txid)) {
            res.json({ error: errors.not_valid_txid });
            return false;
        }

        const tx = await db.collection(col.txs)
            .findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            res.json({ error: errors.tx_not_found });
            return false;
        }

        const blockRpc = await rpc.getBlock(tx.blockhash);
        tx.confirmations = blockRpc.confirmations;

        res.json({ data: tx });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

// inputs an recipients
router.get('/:string/:txid/:offset', async (req, res) => {
    const { db, blockchain, statuses, errors, config: { col } } = req.app.locals;

    try {
        const string = req.params.string;
        const txid = req.params.txid;
        let offset = req.params.offset;

        if (!blockchain.isHash(txid)) {
            res.json({ error: errors.not_valid_txid });
            return false;
        }

        if (!blockchain.isSafePositiveInt(offset)) {
            res.json({ error: errors.not_valid_int });
            return false;
        }

        offset = Number(offset);

        const txs = db.collection(col.txs);
        const tx = await txs.findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            res.json({ error: errors.tx_not_found });
            return false;
        }

        let total;

        switch (string) {
            case 'inputs':
                const inputs = await blockchain.getInputs(txs, tx);
                total = inputs.length;

                res.json({ data: inputs, total });
                break;
            case 'recipients':
                const recipients = await blockchain.getRecipients(tx);
                total = recipients.length;

                res.json({ data: recipients, total });
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