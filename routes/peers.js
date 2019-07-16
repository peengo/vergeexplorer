const Router = require('koa-router');
const router = new Router();

router.get('/', async (ctx) => {
    try {
        const { rpc, config: { limit } } = ctx.locals;

        const loopback = '127.0.0.1';

        let { result: peers } = await rpc.getPeerInfo();

        peers = peers
            .sort((a, b) => b.conntime - a.conntime)
            .slice(0, limit)
            .filter(peer => !peer.addr.includes(loopback))
            .map(peer => {
                peer.subver = peer.subver.replace(/[/]/g, '');

                return peer;
            });

        ctx.body = { data: peers };
    } catch (error) {
        throw new Error(error);
    }
});

module.exports = router;
