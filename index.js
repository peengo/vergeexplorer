'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const statuses = require('./util/statuses');
const errors = require('./util/errors');
const Rpc = require('./util/rpc');
const blockchain = require('./util/blockchain');
const mongoDb = require('mongodb').MongoClient;
// const BitcoinRpc = require('bitcoin-rpc-promise');

const app = express();

// RPC
let rpc;

(async () => {
    try {
        // rpc = new BitcoinRpc(`http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`);
        rpc = new Rpc(`http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`);
        await rpc.init();
        console.log('RPC initialized');
    } catch (error) {
        console.error(error);
    }
})();

// DB
(async () => {
    try {
        const client = await mongoDb.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true });
        const db = client.db(process.env.DB_NAME);
        console.log('MongoDB connected');

        const { collections } = config;

        app.locals.collections = {
            blocks: db.collection(collections.blocks),
            txs: db.collection(collections.txs),
            addresses: db.collection(collections.addresses),
            address_txs: db.collection(collections.address_txs),
            searches: db.collection(collections.searches),
        };
    } catch (error) {
        console.error(error);
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
    blockchain,
    rpc
};

Object.assign(app.locals, locals);

const routes = [
    'info',
    'latest',
    'block',
    'tx',
    'richlist',
    'peers',
    'address',
    'search'
];

for (const route of routes) {
    app.use(`/${route}`, require(`./routes/${route}`));
}

app.use((req, res, next) => {
    res.status(404).json(statuses[404]);
});

app.use((error, req, res, next) => {
    console.error(error.stack);

    if (error.type === 'entity.parse.failed') {
        res.status(400).json({ error: errors.not_valid_JSON });
    } else {
        res.status(500).json(statuses[500]);
    }
});

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`));