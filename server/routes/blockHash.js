const Router = require('koa-router');
const router = new Router();

router.get('/:height', async (ctx) => {
    try {
        const { blockchain, errors, rpc } = ctx.locals;

        let height = ctx.params.height;

        if (!blockchain.isInt(height)) {
            ctx.status = 400;
            ctx.body = { error: errors.not_valid_int };
            return false;
        }

        height = Number(height);

        const { result: blockHash, error: blockHashError } = await rpc.getBlockHash([height]);

        if (blockHashError) throw blockHashError;

        ctx.body = { data: { blockhash: blockHash } };
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
