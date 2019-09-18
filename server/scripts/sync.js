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
                    ios,
                    addresses
                }
            } = await dbConnect();

            while (true) {
                let dbBlockCount = await blocks.countDocuments({});
                const { result: rpcBlockCount, error: blockCountError } = await rpc.getBlockCount();

                if (blockCountError) throw blockCountError;

                const blockDiff = rpcBlockCount - dbBlockCount;

                console.log(`Blocks in DB: ${dbBlockCount}`);
                console.log(`Blocks in Blockchain: ${rpcBlockCount}`);
                console.log(`Block difference: ${blockDiff}`);

                const blockScanOffset = Number(process.argv[2]) || 1000;

                const scanLabel = `Scanning last ${blockScanOffset} blocks`;

                console.time(scanLabel);
                if (dbBlockCount > blockScanOffset) {
                    const blockScanStart = dbBlockCount - blockScanOffset;

                    let blockScanHeights = [];

                    for (let scanHeight = blockScanStart; scanHeight < dbBlockCount; scanHeight++) {
                        blockScanHeights.push(scanHeight);
                    }

                    const randomBoolean = Math.random() >= 0.5;

                    if (randomBoolean) {
                        blockScanHeights.reverse();
                    }

                    for (let scanHeight of blockScanHeights) {
                        const { result: rpcBlockHash, error: blockHashError } = await rpc.getBlockHash([scanHeight]);

                        if (blockHashError) throw blockHashError;

                        let dbBlock = await blocks.findOne({ height: scanHeight });

                        let dbBlockHash = null;

                        if (dbBlock != null) dbBlockHash = dbBlock.hash;

                        if (dbBlock == null) {
                            console.log(`Block missing at heigth ${scanHeight}`);

                            const { result: rpcBlockHash, error: blockHashError } = await rpc.getBlockHash([scanHeight]);

                            if (blockHashError) throw blockHashError;

                            const { result: rpcBlock, error: blockError } = await rpc.getBlock([rpcBlockHash, 1]);

                            if (blockError) throw blockError;

                            const session = client.startSession();

                            session.startTransaction();
                            try {
                                console.log(`Adding Block: ${rpcBlock.hash}`);
                                await addBlock(rpcBlock, { blocks, txs, ios, addresses, session, rpc });

                                await session.commitTransaction();
                                session.endSession();
                            } catch (error) {
                                await session.abortTransaction();
                                session.endSession();

                                throw error;
                            }
                        } else if (rpcBlockHash !== dbBlockHash) {
                            console.log(`Invalid block found at height ${scanHeight}`);
                            console.log(`Blockchain: ${rpcBlockHash} | DB: ${dbBlockHash}`);

                            // process.exit();

                            const { result: rpcBlock, error: blockError } = await rpc.getBlock([rpcBlockHash, 1]);

                            if (blockError) throw blockError;

                            let session = client.startSession();

                            session.startTransaction();
                            try {
                                console.log(`Removing Block: ${dbBlockHash}`);
                                await removeBlock(dbBlockHash, { blocks, txs, ios, addresses, session });

                                await session.commitTransaction();
                                session.endSession();
                            } catch (error) {
                                await session.abortTransaction();
                                session.endSession();

                                throw error;
                            }

                            session = client.startSession();

                            session.startTransaction();
                            try {
                                console.log(`Adding Block: ${rpcBlock.hash}`);
                                await addBlock(rpcBlock, { blocks, txs, ios, addresses, session, rpc });

                                await session.commitTransaction();
                                session.endSession();
                            } catch (error) {
                                await session.abortTransaction();
                                session.endSession();

                                throw error;
                            }
                        }
                    }
                }
                console.timeEnd(scanLabel);

                if (blockDiff > 0) {
                    for (let height = dbBlockCount; height < rpcBlockCount; height++) {
                        const { result: hash, error: blockHashError } = await rpc.getBlockHash([height]);

                        if (blockHashError) throw blockHashError;

                        const { result: block, error: blockError } = await rpc.getBlock([hash, 1]);

                        if (blockError) throw blockError;

                        const session = client.startSession();

                        session.startTransaction();
                        try {
                            await addBlock(block, { blocks, txs, ios, addresses, session, rpc });

                            await session.commitTransaction();
                            session.endSession();
                        } catch (error) {
                            await session.abortTransaction();
                            session.endSession();

                            throw error;
                            // console.error(error);
                            // console.log(`height: ${height} hash: ${hash}`);
                            // process.exit();
                        }
                        console.log(`height: ${height} hash: ${hash}`);
                    }
                }

                console.log('...Sleeping...Waiting for new blocks...');
                await delay(10000);
            }
        } catch (error) {
            console.error(error);
        } finally {
            console.log('...Sleeping...');
            await delay(30000);
        }
    }
})();

async function addBlock(block, { blocks, txs, ios, addresses, session, rpc }) {
    const txids = block.tx;

    if (block.height == 0) {
        await blocks.insertOne(block, { session });
    } else {
        let transactions = [];

        transactions = await Promise.all(txids.map(txid => rpc.getRawTransaction([txid, 1])));
        transactions = transactions.map(tx => tx.result);

        await blocks.insertOne(block, { session });

        if (transactions.length > 0)
            await txs.insertMany(transactions, { session });

        let blockIOOffsets = [];

        for (const tx of transactions) {
            const { addressTxInserts, txIOOffsets } = await blockchain.getIOInsertsAndOffsets(tx, txs, transactions, blockIOOffsets);

            blockIOOffsets = blockchain.sumAddressOffsets(txIOOffsets, blockIOOffsets);

            if (addressTxInserts.length > 0)
                await ios.insertMany(addressTxInserts, { session });
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
    }
}

async function removeBlock(invalidBlockHash, { blocks, txs, ios, addresses, session }) {
    const invalidBlock = await blocks.findOne({ hash: invalidBlockHash });
    const IOs = await ios.find({ txid: { $in: invalidBlock.tx } }).toArray();

    let IOOffsets = blockchain.findAndUpdateOffsets(IOs);

    const addressList = IOOffsets.map(offset => offset.address);
    let addressUpdatesDb = await addresses.find({ address: { $in: addressList } }).toArray();

    IOOffsets.sort((a, b) => a.address.localeCompare(b.address));
    addressUpdatesDb.sort((a, b) => a.address.localeCompare(b.address));

    await blocks.deleteOne({ hash: invalidBlockHash }, { session });

    if (invalidBlock.tx.length > 0) {
        await txs.deleteMany({ txid: { $in: invalidBlock.tx } }, { session });
        await ios.deleteMany({ txid: { $in: invalidBlock.tx } }, { session });
    }

    if (addressUpdatesDb.length > 0) {
        addressUpdatesDb = blockchain.calculateUpdateInvalidBalances(addressUpdatesDb, IOOffsets);

        for (const addressUpdate of addressUpdatesDb) {
            await addresses.findOneAndReplace({ address: addressUpdate.address }, addressUpdate, { session });
        }
    }
}
