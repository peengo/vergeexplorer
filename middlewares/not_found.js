const statuses = require('../utils/statuses');

const attachNotFound = app => {
    app.use((req, res) => {
        res.status(404).json(statuses[404]);
    });
};

module.exports = attachNotFound;