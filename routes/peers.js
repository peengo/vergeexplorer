const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { rpc, statuses, config: { limit } } = req.app.locals;

    try {
        const loopback = '127.0.0.1';

        let peers = await rpc.getPeerInfo();

        peers = peers
            .splice(0, limit)
            .sort((a, b) => b.conntime - a.conntime)
            .map(peer => {
                if (!peer.addr.includes(loopback)) {
                    peer.addr = peer.addr.split(':')[0];
                    peer.subver = peer.subver.replace(/[/]/g, '');
                }

                return peer;
            });

        res.json({ data: peers });
    } catch (error) {
        console.error(error);
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;