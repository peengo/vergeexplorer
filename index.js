'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const delay = require('delay');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connection');
const statuses = require('./utils/statuses');
const errors = require('./utils/errors');
const blockchain = require('./utils/blockchain');
const getPrice = require('./utils/price');
const buildRoutes = require('./routes/routes');
const attachNotFound = require('./middlewares/not_found');
const attachErrorHandler = require('./middlewares/error_handler');

const app = express();

(async () => {
    try {
        app.locals.rpc = await rpcInit();
        app.locals.collections = await dbConnect(config.collections);

        for (; ;) {
            app.locals.price = await getPrice();
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

const locals = { config, statuses, errors, blockchain };
Object.assign(app.locals, locals);

// routes
buildRoutes(app);

// middlewares
attachNotFound(app);
attachErrorHandler(app);

app.listen(
    process.env.PORT,
    () => console.log(`Server listening on port ${process.env.PORT}`)
);
