const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc, blockchain, collections: { addresses, txs }, errors } = ctx.locals;

        let search = '';

        if (ctx.request.body && ctx.request.body.search)
            search = ctx.request.body.search;

        // let search = ctx.request.body.search;

        // if (typeof search !== 'string') search = '';

        if (blockchain.isInt(search)) {
            // try {
            search = Number(search);

            const { result: hash, error: hashError } = await rpc.getBlockHash([search]);

            if (hashError) throw hashError;

            const { result: block, error: blockError } = await rpc.getBlock([hash]);

            if (blockError) throw hashError;

            ctx.body = { data: { redirect: 'block', hash: block.hash } };
            return false;
            // } catch (error) {
            //     ctx.status = 404;
            //     ctx.body = { error: error.message };

            //     console.error(error);
            //     return false;
            // }
        }

        if (blockchain.isAddress(search)) {
            const address = await addresses.findOne({ address: search });

            if (address) {
                ctx.body = { data: { redirect: 'address', address: address.address } };
                return false;
            } else {
                ctx.status = 404;
                ctx.body = { error: errors.address_not_found };
                return false;
            }
        }

        if (blockchain.isHash(search)) {
            const tx = await txs.findOne({ txid: search });

            if (tx) {
                ctx.body = { data: { redirect: 'tx', txid: tx.txid } };
                return false;
            }

            // try {
            const { result: block, error } = await rpc.getBlock([search]);

            if (error) throw error;

            if (block) {
                ctx.body = { data: { redirect: 'block', hash: block.hash } };
                return false;
            }
            // } catch (error) {
            //     if (typeof error.code !== 'undefined' && error.code === -5) {
            //         ctx.status = 404;
            //         ctx.body = { error: error.message };
            //     } else {
            //         ctx.status = 400;
            //         ctx.body = { error: error.message };
            //     }

            //     console.error(error);
            //     return false;
            // }
        }

        ctx.status = 400;
        ctx.body = { error: errors.invalid_search_param };
    } catch (error) {
        if (error.data.error.code && error.data.error.message) {
            switch (error.data.error.code) {
                case -1:
                    ctx.throw(400, error.data.error.message);
                    break;
                case -5:
                    ctx.throw(404, error.data.error.message);
                    break;
                default:
                    ctx.throw(error.status, error.data.error.message)
                    break;
            }
            // ctx.throw(error.status, error.data.error.message);
        } else {
            // console.error(error.status);
            ctx.throw(500);
        }

        // console.error(error);
        // ctx.throw(500);
    }
});

module.exports = router;
