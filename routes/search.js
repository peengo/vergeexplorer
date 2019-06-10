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

                const { result: hash, error: hashError } = await rpc.getblockhash([search]);

                if (hashError) throw hashError;

                const { result: block, error: blockError } = await rpc.getblock([hash]);

                if (blockError) throw hashError;

                res.json({ data: { redirect: 'block', hash: block.hash } });
                return false;
            } catch (error) {
                res.json({ error: error.message });
                
                console.error(error);
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

            try {
                const { result: block, error } = await rpc.getblock([search]);

                if (error) throw error;

                if (block) {
                    res.json({ data: { redirect: 'block', hash: block.hash } });
                    return false;
                }
            } catch (error) {
                if (typeof error.code !== 'undefined' && error.code === -5) {
                    res.status(404).json({ error: error.message });
                } else {
                    res.status(400).json({ error: error.message });
                }

                console.error(error);
                return false;
            }
        }

        res.status(400).json({ error: errors.invalid_search_param });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;
