const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const { db, statuses, config: { col, limit } } = req.app.locals;

    try {
        const richlist = await db.collection(col.addresses)
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