const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { rpc, config: { limit } } = req.app.locals;

        const loopback = '127.0.0.1';

        let { result: peers } = await rpc.getpeerinfo();

        peers = peers
            .sort((a, b) => b.conntime - a.conntime)
            .slice(0, limit)
            .filter(peer => !peer.addr.includes(loopback))
            .map(peer => {
                peer.subver = peer.subver.replace(/[/]/g, '');

                return peer;
            });

        res.json({ data: peers });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;
