const errors = require('../utils/errors');
const statuses = require('../utils/statuses');

const attachErrorHandler = app => {
    // eslint-disable-next-line no-unused-vars
    app.use((error, req, res, next) => {
        // non valid JSON on POST check
        if (error.type === 'entity.parse.failed') {
            res.status(400).json({ error: errors.not_valid_JSON });
        } else {
            res.status(500).json(statuses[500]);
        }
    });
};

module.exports = attachErrorHandler;
