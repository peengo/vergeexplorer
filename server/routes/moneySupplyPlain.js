const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { getTxOutSetInfo } = ctx.locals;
        const moneySupply = getTxOutSetInfo.total_amount;
        ctx.body = moneySupply.toString();
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
