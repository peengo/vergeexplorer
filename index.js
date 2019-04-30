'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const delay = require('delay');

const config = require('./config');
const statuses = require('./util/statuses');
const errors = require('./util/errors');
const blockchain = require('./util/blockchain');
const price = require('./util/price');
const dbConnect = require('./db/connection');
const rpcInit = require('./rpc/init');
const routes = require('./routes/routes');

const app = express();

(async () => {
    try {
        app.locals.rpc = await rpcInit();
        app.locals.collections = await dbConnect(config.collections);

        for (; ;) {
            app.locals.price = await price();
            await delay(60000);
        }
    } catch (error) {
        console.log(error);
    }
})();

app.disable('x-powered-by');
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const locals = {
    config,
    statuses,
    errors,
    blockchain
};
Object.assign(app.locals, locals);

routes(app);

app.use((req, res) => {
    res.status(404).json(statuses[404]);
});

app.use((error, req, res) => {
    console.error(error.stack);

    // non valid JSON on POST check
    if (req.method === 'POST' && error.type === 'entity.parse.failed') {
        res.status(400).json({ error: errors.not_valid_JSON });
    } else {
        res.status(500).json(statuses[500]);
    }
});

app.listen(process.env.PORT, () => console.log(`Server listening on port ${process.env.PORT}`));
