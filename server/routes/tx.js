const Router = require('koa-router');
const router = new Router();

router.get('/:txid', async (ctx) => {
    try {
        const { blockchain, collections: { txs }, rpc, errors } = ctx.locals;

        const txid = ctx.params.txid;

        if (!blockchain.isHash(txid)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_txid };
            return false;
        }

        let tx = await txs
            .findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            const { result: mempool, error: mempoolError } = await rpc.getRawMempool();

            if (mempoolError) throw mempoolError;

            if (mempool.includes(txid)) {
                const { result: mempoolTx, error: txError } = await rpc.getRawTransaction([txid, 1]);

                if (txError) throw txError;

                tx = mempoolTx;
            } else {
                ctx.status = 404;
                ctx.body = { error: errors.tx_not_found };
                return false;
            }
        }

        if (tx.blockhash) {
            const { result: blockRpc, error } = await rpc.getBlock([tx.blockhash]);

            if (error) {
                ctx.status = 400;
                ctx.body = { error: error.message };
                return false;
            }

            tx.confirmations = blockRpc.confirmations;
        }

        ctx.body = { data: tx };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

// inputs and recipients
router.get('/:string/:txid/:skip/:limit', async (ctx) => {
    try {
        const { collections: { txs }, blockchain, rpc, errors, config: { limits: { block: allowedLimit } } } = ctx.locals;

        const string = ctx.params.string;
        const txid = ctx.params.txid;
        let skip = ctx.params.skip;
        let limit = ctx.params.limit;

        if (!blockchain.isHash(txid)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_txid };
            return false;
        }

        if (!blockchain.isInt(skip) && !blockchain.isInt(limit)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        skip = Number(skip);
        limit = Number(limit);

        limit = (limit >= 1 && limit <= allowedLimit) ? limit : allowedLimit;

        let tx = await txs.findOne({ txid }, { projection: { _id: 0 } });

        let mempoolTxs = [];

        if (!tx) {
            const { result: mempool, error: mempoolError } = await rpc.getRawMempool();

            if (mempoolError) throw mempoolError;

            if (mempool.includes(txid)) {
                const { result: mempoolTx, error: txError } = await rpc.getRawTransaction([txid, 1]);

                mempoolTxs = await Promise.all(mempool.map(txid => rpc.getRawTransaction([txid, 1])));
                mempoolTxs = mempoolTxs.map(tx => tx.result);

                if (txError) throw txError;

                tx = mempoolTx;
            } else {
                ctx.status = 404;
                ctx.body = { error: errors.tx_not_found };
                return false;
            }
        }

        let total;

        let inputs, recipients;

        switch (string) {
            case 'inputs':
                inputs = await blockchain.getInputs(tx, txs, mempoolTxs);
                total = inputs.length;

                inputs = inputs.slice(skip, skip + limit);

                ctx.body = { data: inputs, total };
                break;
            case 'recipients':
                recipients = blockchain.getRecipients(tx);
                total = recipients.length;

                recipients = recipients.slice(skip, skip + limit);

                ctx.body = { data: recipients, total };
                break;
            default:
                ctx.status = 400;
                ctx.body = { error: errors.invalid_parameter };
                break;
        }
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
