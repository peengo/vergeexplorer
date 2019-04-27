const express = require('express');
const router = express.Router();

router.get('/:txid', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { blockchain, collections: { txs, }, rpc, errors } = req.app.locals;

        const txid = req.params.txid;

        if (!blockchain.isHash(txid)) {
            res.status(400).json({ error: errors.not_valid_txid });
            return false;
        }

        const tx = await txs
            .findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            res.json({ error: errors.tx_not_found });
            return false;
        }

        // const blockRpc = await rpc.getBlock(tx.blockhash);
        const { result: blockRpc } = await rpc.getblock([tx.blockhash]);
        tx.confirmations = blockRpc.confirmations;

        res.json({ data: tx });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

// inputs an recipients
router.get('/:string/:txid/:offset', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { collections: { txs }, blockchain, errors } = req.app.locals;

        const string = req.params.string;
        const txid = req.params.txid;
        let offset = req.params.offset;

        if (!blockchain.isHash(txid)) {
            res.status(400).json({ error: errors.not_valid_txid });
            return false;
        }

        if (!blockchain.isInt(offset)) {
            res.status(400).json({ error: errors.not_valid_int });
            return false;
        }

        offset = Number(offset);

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
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;