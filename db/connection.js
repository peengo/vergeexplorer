require('dotenv').config();
const mongoDb = require('mongodb').MongoClient;

const connect = async (collections) => {
    const client = await mongoDb.connect(
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
        { useNewUrlParser: true },
    );

    const db = client.db(process.env.DB_NAME);
    console.log('MongoDB connected');

    return {
        blocks: db.collection(collections.blocks),
        txs: db.collection(collections.txs),
        addresses: db.collection(collections.addresses),
        address_txs: db.collection(collections.address_txs),
        searches: db.collection(collections.searches)
    };
};

module.exports = connect;
