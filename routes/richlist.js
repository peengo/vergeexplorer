const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { statuses } = req.app.locals;

    try {
        const { collections: { addresses }, config: { limit } } = req.app.locals;

        const richlist = await addresses
            .find({})
            .project({ _id: 0 })
            .sort({ balance: -1 })
            .collation({ locale: 'en_US', numericOrdering: true })
            .limit(limit)
            .toArray();

        res.json({ data: richlist });
    } catch (error) {
        console.error(error)
        res.status(500).json(statuses[500]);
    }
});

module.exports = router;