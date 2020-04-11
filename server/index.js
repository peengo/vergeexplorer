'use strict';
require('dotenv').config();

const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const error = require('koa-json-error');
const helmet = require('koa-helmet');
const { promisify } = require('util');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connect');
const errors = require('./utils/errors');
const blockchain = require('./utils/blockchain');

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
            const { result: getTxOutSetInfo } = await app.context.locals.rpc.getTxOutSetInfo();

            Object.assign(app.context.locals, { getTxOutSetInfo });
            await delay(60000);
        }
    } catch (error) {
        console.error(error);
    }
})();

Object.assign(app.context.locals, { config, errors, blockchain });

function formatError(error) {
    return {
        // status: error.status,
        error: error.message
    };
}

app.use(cors());
app.use(logger());
app.use(bodyparser());
app.use(error(formatError));
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'API' }));

router.use('/address', require('./routes/address').routes());
router.use('/block', require('./routes/block').routes());
router.use('/info', require('./routes/info').routes());
router.use('/latest', require('./routes/latest').routes());
router.use('/peers', require('./routes/peers').routes());
router.use('/richlist', require('./routes/richlist').routes());
router.use('/search', require('./routes/search').routes());
router.use('/tx', require('./routes/tx').routes());
router.use('/pending', require('./routes/pending').routes());

// Add tests for this
router.use('/difficulty', require('./routes/difficulty').routes());
router.use('/blockcount', require('./routes/blockCount').routes());
router.use('/blockhash', require('./routes/blockHash').routes());
router.use('/moneysupply', require('./routes/moneySupply').routes());
router.use('/balance', require('./routes/balance').routes());

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
