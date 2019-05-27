'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const delay = require('delay');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connect');
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
        const dbLocals = await dbConnect();

        if (dbLocals.client.isConnected)
            console.log('MongoDB connected');

        Object.assign(app.locals, dbLocals);

        while (true) {
            app.locals.price = await getPrice();
            await delay(60000);
        }
    } catch (error) {
        console.log(error);
    }
})();

app.use(morgan('dev'));
app.disable('x-powered-by');
app.use(cors());
app.use('/search', express.json());

const locals = { config, statuses, errors, blockchain };
Object.assign(app.locals, locals);

buildRoutes(app);

attachNotFound(app);
attachErrorHandler(app);

app.listen(
    process.env.PORT,
    () => console.log(`Server listening on port ${process.env.PORT}`)
);
