'use strict';
const rpcInit = require('../rpc/init');
const dbConnect = require('../db/connect');
const blockchain = require('../utils/blockchain');
const { promisify } = require('util');

const delay = promisify(setTimeout);

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

            let dbBlockCount = await blocks.countDocuments({});
            const { result: rpcBlockCount } = await rpc.getblockcount();
            const blockDiff = rpcBlockCount - dbBlockCount;

            console.log(`Blocks in DB: ${dbBlockCount}`);
            console.log(`Blocks in Blockchain: ${rpcBlockCount}`);
            console.log(`Block difference: ${blockDiff}`);

            if (blockDiff > 0) {
                for (let height = dbBlockCount; height < rpcBlockCount; height++) {
                    const { result: hash } = await rpc.getblockhash([height]);
                    const { result: block } = await rpc.getblock([hash, 1]);

                    if (height > 0) {
                        const prevBlock = await blocks.findOne({ height: height - 1 });

                        if (!prevBlock) {
                            console.log('previous block not found at height:', height - 1);
                            process.exit();
                        }
                    }

                    const txids = block.tx;

                    const getTx = async txid => {
                        return await await rpc.getrawtransaction([txid, 1]);
                    };

                    let transactions = [];

                    if (height > 0) {
                        transactions = await Promise.all(txids.map(txid => getTx(txid)));

                        const errors = transactions.find(tx => tx.error !== null);

                        if (!errors) {
                            transactions = transactions.map(tx => tx.result);

                            if (transactions.length !== txids.length) {
                                console.log('tx count does not match');
                                process.exit();
                            }
                        } else {
                            console.error(errors);
                            process.exit();
                        }
                    }
                    // starting session & transaction
                    const session = client.startSession();

                    session.startTransaction();

                    try {
                        // block insert
                        await blocks.insertOne(block, { session });

                        // txs insert
                        if (transactions.length > 0)
                            await txs.insertMany(transactions, { session });

                        // address inserts & updates
                        let blockIOOffsets = [];

                        for (const tx of transactions) {
                            const { addressTxInserts, txIOOffsets } = await blockchain.getIOInsertsAndOffsets(tx, txs, transactions, blockIOOffsets);

                            blockIOOffsets = blockchain.sumAddressOffsets(txIOOffsets, blockIOOffsets);

                            if (addressTxInserts.length > 0)
                                await address_txs.insertMany(addressTxInserts, { session });
                        }

                        const addressList = blockIOOffsets.map(offset => offset.address);
                        let addressUpdatesDb = await addresses.find({ address: { $in: addressList } }).toArray();

                        addressUpdatesDb.sort((a, b) => a.address.localeCompare(b.address));


                        let addressUpdates = blockIOOffsets.filter(o => addressUpdatesDb.find(o2 => o.address === o2.address)).sort((a, b) => a.address.localeCompare(b.address));
                        let addressInserts = blockIOOffsets.filter(o => !addressUpdatesDb.find(o2 => o.address === o2.address));

                        if (addressUpdatesDb.length > 0) {
                            addressUpdatesDb = blockchain.calculateUpdateBalances(addressUpdatesDb, addressUpdates);

                            for (const addressUpdate of addressUpdatesDb) {
                                await addresses.findOneAndReplace({ address: addressUpdate.address }, addressUpdate, { session });
                            }
                        }

                        if (addressInserts.length > 0) {
                            addressInserts = blockchain.calculateInsertBalances(addressInserts);

                            await addresses.insertMany(addressInserts, { session });
                        }

                        // commiting transaction & ending session
                        await session.commitTransaction();
                        session.endSession();
                    } catch (error) {
                        // aborting transaction & ending session
                        await session.abortTransaction();
                        session.endSession();

                        throw error;
                    }
                    console.log(`height: ${height} hash: ${hash}`);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            console.log('...Sleeping...');
            await delay(60000);
        }
    }
})();

