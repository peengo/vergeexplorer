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

        const tx = await txs
            .findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            ctx.status = 404;
            ctx.body = { error: errors.tx_not_found };
            return false;
        }

        const { result: blockRpc, error } = await rpc.getBlock([tx.blockhash]);

        if (error) {
            ctx.status = 400;
            ctx.body = { error: error.message };
            return false;
        }

        tx.confirmations = blockRpc.confirmations;

        ctx.body = { data: tx };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

// inputs an recipients
router.get('/:string/:txid/:offset', async (ctx) => {
    try {
        const { collections: { txs }, blockchain, errors, config: { limit } } = ctx.locals;

        const string = ctx.params.string;
        const txid = ctx.params.txid;
        let offset = ctx.params.offset;

        if (!blockchain.isHash(txid)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_txid };
            return false;
        }

        if (!blockchain.isInt(offset)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        offset = Number(offset);

        const tx = await txs.findOne({ txid }, { projection: { _id: 0 } });

        if (!tx) {
            ctx.status = 404;
            ctx.body = { error: errors.tx_not_found };
            return false;
        }

        let total;

        let inputs, recipients;

        switch (string) {
            case 'inputs':
                inputs = await blockchain.getInputs(tx, txs);
                total = inputs.length;

                inputs = inputs.slice(offset, offset + limit);

                ctx.body = { data: inputs, total };
                break;
            case 'recipients':
                recipients = blockchain.getRecipients(tx);
                total = recipients.length;

                recipients = recipients.slice(offset, offset + limit);

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
