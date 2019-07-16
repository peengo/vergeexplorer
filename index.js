'use strict';
require('dotenv').config();

const Koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const cors = require('@koa/cors');
const logger = require('koa-logger');
const { promisify } = require('util');

const config = require('./config');
const rpcInit = require('./rpc/init');
const dbConnect = require('./db/connect');
const errors = require('./utils/errors');
const blockchain = require('./utils/blockchain');
const getPrice = require('./utils/price');
const buildRoutes = require('./routes/routes');

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

app.use(logger());
app.use(cors());
app.use(bodyparser({
    onerror: (error, ctx) => {
        console.error(error);

        ctx.status = 500;
        ctx.body = {
            status: ctx.status,
            message: ctx.message
        };
    }
}));

const locals = { config, errors, blockchain };

Object.assign(app.context.locals, locals);

// error handler
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        console.error(error);
        ctx.status = error.status || 500;
        ctx.body = {
            status: ctx.status,
            message: ctx.message
        };
    }
});

buildRoutes(router);
app.use(router.routes());
app.use(router.allowedMethods());

// 404 handler
app.use(async (ctx) => {
    ctx.status = 404;
    ctx.body = {
        status: ctx.status,
        message: ctx.message
    };
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
