const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { rpc, blockchain, collections: { addresses, txs }, errors } = req.app.locals;

        const search = req.body.search.trim();

        if (blockchain.isInt(search)) {
            try {
                const block = await rpc.call('getblockbynumber', Number(search), true);
                res.json({ data: { redirect: 'block', hash: block.hash } });
                return false;
            } catch (error) {
                console.log(error);
                res.status(400).json({ error: errors.block_not_found })
                return false;
            }
        }

        if (blockchain.isAddress(search)) {
            const address = await addresses.findOne({ address: search });

            if (address) {
                res.json({ data: { redirect: 'address', address: address.address } });
                return false;
            } else {
                res.status(400).json({ error: errors.address_not_found });
                return false;
            }
        }

        if (blockchain.isHash(search)) {
            try {
                const block = await rpc.getBlock(search);

                res.json({ data: { redirect: 'block', hash: block.hash } })
                return false;
            } catch (error) {
                const tx = await txs.findOne({ txid: search });

                if (tx) {
                    res.json({ data: { redirect: 'tx', txid: tx.txid } })
                    return false;
                } else {
                    res.status(400).json({ error: errors.block_tx_not_found })
                    return false;
                }
            }
        }

        res.status(400).json({ error: errors.invalid_search_param });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;