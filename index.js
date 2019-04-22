'use strict';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const statuses = require('./util/statuses');
const errors = require('./util/errors');
const blockchain = require('./util/blockchain');
const mongoDb = require('mongodb').MongoClient;
const BitcoinRpc = require('bitcoin-rpc-promise');

// RPC
let rpc;
try {
    rpc = new BitcoinRpc(`http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`);
} catch (error) {
    console.error(error);
}

// DB
(async () => {
    try {
        const client = await mongoDb.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, { useNewUrlParser: true });
        const db = client.db(process.env.DB_NAME);
        console.log('MongoDB connected');

        app.locals.db = db;
    } catch (error) {
        console.error(error);
    }
})();

const app = express();

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

app.locals = Object.assign(app.locals, locals);

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