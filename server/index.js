'use strict';
require('dotenv').config();

const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const error = require('koa-json-error');
const { promisify } = require('util');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connect');
const errors = require('./utils/errors');
const blockchain = require('./utils/blockchain');
const getPrice = require('./utils/price');

const delay = promisify(setTimeout);

const app = new Koa();
const router = new Router();

app.context.locals = {}; // local vars

(async () => {
    try {
        app.context.locals.rpc = await rpcInit();
        const dbLocals = await dbConnect();

        if (dbLocals.client.isConnected)
            console.log('MongoDB connected');

        Object.assign(app.context.locals, dbLocals);

        while (true) {
            const [{ result: getTxOutSetInfo }, price] = await Promise.all([
                app.context.locals.rpc.getTxOutSetInfo(),
                getPrice()
            ]);

            Object.assign(app.context.locals, { getTxOutSetInfo, price });
            await delay(60000);
        }
    } catch (error) {
        console.error(error);
    }
})();

Object.assign(app.context.locals, { config, errors, blockchain });

function formatError(error) {
    if (error.status !== 404)
        console.error(error);
    return {
        status: error.status,
        message: error.message
    };
}

app.use(cors());
app.use(logger());
app.use(bodyparser());
app.use(error(formatError));

router.use('/address', require('./routes/address').routes());
router.use('/block', require('./routes/block').routes());
router.use('/info', require('./routes/info').routes());
router.use('/latest', require('./routes/latest').routes());
router.use('/peers', require('./routes/peers').routes());
router.use('/richlist', require('./routes/richlist').routes());
router.use('/search', require('./routes/search').routes());
router.use('/tx', require('./routes/tx').routes());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
