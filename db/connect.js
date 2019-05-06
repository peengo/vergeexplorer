require('dotenv').config();
const { collections } = require('../config');
const { MongoClient } = require('mongodb');

const dbConnect = async (database = process.env.DB_NAME) => {
    const client = await MongoClient.connect(
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${database}`,
        { useNewUrlParser: true, replicaSet: 'rs0' },
    );

    const db = client.db();

    return {
        client,
        db,
        collections: {
            blocks: db.collection(collections.blocks),
            txs: db.collection(collections.txs),
            addresses: db.collection(collections.addresses),
            address_txs: db.collection(collections.address_txs)
        }
    };
};

module.exports = dbConnect;
