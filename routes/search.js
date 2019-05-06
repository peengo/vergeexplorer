const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { rpc, blockchain, collections: { addresses, txs }, errors } = req.app.locals;

        let search = req.body.search;

        if (typeof search !== 'string') search = '';

        if (blockchain.isInt(search)) {
            try {
                search = Number(search);

                const { result: block, error } = await rpc.getblockbynumber([search]);

                if (error) {
                    res.json({ error: error.message });
                    return false;
                }

                res.json({ data: { redirect: 'block', hash: block.hash } });
                return false;
            } catch (error) {
                // console.error(error);
                // res.json({ error: errors.block_not_found });
                console.error(error);
                res.status(500).json(statuses[500]);
                return false;
            }
        }

        if (blockchain.isAddress(search)) {
            const address = await addresses.findOne({ address: search });

            if (address) {
                res.json({ data: { redirect: 'address', address: address.address } });
                return false;
            } else {
                res.json({ error: errors.address_not_found });
                return false;
            }
        }

        if (blockchain.isHash(search)) {
            const tx = await txs.findOne({ txid: search });

            if (tx) {
                res.json({ data: { redirect: 'tx', txid: tx.txid } });
                return false;
            }

            const { result: block } = await rpc.getblock([search]);

            if (block) {
                res.json({ data: { redirect: 'block', hash: block.hash } });
                return false;
            }

            res.status(404).json({ error: errors.block_tx_not_found });
            return false;
        }

        res.status(400).json({ error: errors.invalid_search_param });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;