const Router = require('koa-router');
const router = new Router();

// address info
router.get('/:address', async (ctx) => {
    try {
        const { blockchain, collections: { addresses }, errors } = ctx.locals;

        const address = ctx.params.address;

        if (!blockchain.isAddress(address)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_address };
            return false;
        }

        const addr = await addresses
            .findOne({ address }, { projection: { _id: 0 } });

        if (!addr) {
            ctx.status = 404;
            ctx.body = { error: errors.address_not_found };
            return false;
        }

        const balance = addr.balance;

        ctx.body = { data: { balance } };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
