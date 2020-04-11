const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { getTxOutSetInfo } = ctx.locals;
        const { plain } = ctx.query;

        const moneySupply = getTxOutSetInfo.total_amount;

        if (typeof plain !== 'undefined') {
            ctx.body = moneySupply.toString();
        } else {
            ctx.body = { data: { moneysupply: moneySupply } };
        } 
    } catch (error) {
        console.error(error);
        ctx.throw(500);
    }
});

module.exports = router;
