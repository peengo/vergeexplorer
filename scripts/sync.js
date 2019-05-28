'use strict';
const rpcInit = require('../rpc/init');
const dbConnect = require('../db/connect');
const blockchain = require('../utils/blockchain');
const delay = require('delay');

console.log('#######################');
console.log('Sync script starting...');
console.log(`Time: ${new Date().toJSON()}`);

(async () => {
    while (true) {
        try {
            const rpc = await rpcInit();

            const {
                client,
                collections:
                {
                    blocks,
                    txs,
                    addresses,
                    address_txs
                }
            } = await dbConnect();

            const dbBlockCount = await blocks.estimatedDocumentCount();
            const { result: rpcBlockCount } = await rpc.getblockcount();
            const blockDiff = rpcBlockCount - dbBlockCount;

            console.log(`Blocks in DB: ${dbBlockCount}`);
            console.log(`Blocks in Blockchain: ${rpcBlockCount}`);
            console.log(`Block difference: ${blockDiff}`);

            console.time('loop');
            if (blockDiff !== 0) {
                for (let height = dbBlockCount; height < rpcBlockCount; height++) {
                    const { result: hash } = await rpc.getblockhash([height]);

                    const { result: block } = await rpc.getblock([hash, 1]);

                    let transactions = await Promise.all(block.tx.map(async tx => {
                        const { result: transaction, error } = await rpc.getrawtransaction([tx, 1]);

                        if (!error) return transaction;
                    }));

                    transactions = transactions.filter(tx => typeof tx !== 'undefined');

                    // starting session & transaction
                    const session = client.startSession();

                    session.startTransaction();

                    try {
                        // block insert
                        await blocks.insertOne(block, { session });

                        // txs insert
                        if (transactions.length > 0)
                            await txs.insertMany(transactions, { session });

                        // VINS TODO

                        // VOUTS
                        const vouts = [];

                        for (const tx of transactions) {
                            const { addressTxInserts, voutOffsets } = blockchain.getVoutInsertsAndOffsets(tx);

                            blockchain.findAndUpdateValueOffsets(vouts, voutOffsets);

                            // vouts inserts
                            if (addressTxInserts > 0)
                                await address_txs.insertMany(addressTxInserts, { session });
                        }

                        const {
                            inserts: addressVoutInserts,
                            updates: addressVoutUpdates
                        } = await blockchain.getAddressInsertsAndUpdates(vouts, addresses);

                        // address inserts
                        if (addressVoutInserts.length > 0)
                            await addresses.insertMany(addressVoutInserts, { session });

                        // address updates
                        for (const { filter, document } of addressVoutUpdates) {
                            await addresses.findOneAndUpdate(filter, { $set: document }, { session });
                        }

                        // commiting transaction & ending session
                        await session.commitTransaction();
                        session.endSession();
                    } catch (error) {
                        console.error(error);

                        // aborting transaction & ending session
                        await session.abortTransaction();
                        session.endSession();

                        process.exit();
                    }

                    console.log(`height: ${height} hash: ${hash}`);

                    // if (height === 0) break;
                    if (height === 2000) break;
                }
            }
            console.timeEnd('loop');
            process.exit();
        } catch (error) {
            console.error(error);
            process.exit();
        } finally {
            console.log('...Sleeping...');
            await delay(60000);
        }
    }
})();
