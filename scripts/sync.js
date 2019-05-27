'use strict';
const rpcInit = require('../rpc/init');
const dbConnect = require('../db/connect');
const blockchain = require('../utils/blockchain');
const delay = require('delay');
const { decimaljs } = require('./../config.js');
const Decimal = require('decimal.js-light');

Decimal.set({
    precision: decimaljs.precision,
    toExpNeg: decimaljs.toExpNeg
});

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
                    // let { result: block } = await rpc.getblock([hash, 2]);  // 2 for transaction data

                    // const transactions = blockchain.prepareTxs(block);
                    // block = blockchain.prepareBlock(block);

                    let { result: block } = await rpc.getblock([hash, 1]);

                    let transactions = await Promise.all(block.tx.map(async tx => {
                        const { result: transaction, error } = await rpc.getrawtransaction([tx, 1]);
                        if (!error) return transaction;
                    }));

                    transactions = transactions
                        .filter(tx => typeof tx !== 'undefined');
                    // .map(tx => {
                    //     tx._id = tx.txid;
                    //     delete tx.confirmations;

                    //     return tx;
                    // });

                    // block._id = block.hash;
                    // delete block.confirmations;

                    // if (height === 1194) {
                    //     debugger;
                    // }

                    // starting the transaction
                    const session = client.startSession();
                    session.startTransaction();

                    try {
                        await blocks.insertOne(block, { session });

                        if (transactions.length > 0) {
                            await txs.insertMany(transactions, { session });
                        }

                        const vouts = [];

                        for (const tx of transactions) {
                            const voutOffsets = await blockchain.prepareVouts(tx, addresses, address_txs, session);

                            for (const voutOffset of voutOffsets) {
                                const index = vouts.findIndex(vout => vout.address === voutOffset.address);

                                if (index === -1) {
                                    vouts.push(voutOffset);
                                } else {
                                    vouts[index].value = Decimal(vouts[index].value).plus(Decimal(voutOffset.value)).toString();
                                }
                            }
                        }

                        const inserts = [], updates = [];

                        for (const vout of vouts) {
                            const address = await addresses.findOne({ address: vout.address });

                            if (address) {
                                updates.push(vout);
                            } else {
                                inserts.push(vout);
                            }
                        }

                        for (const insert of inserts) {
                            await addresses.insertOne(
                                {
                                    address: insert.address,
                                    sent: '0',
                                    received: insert.value,
                                    balance: insert.value
                                },
                                { session }
                            );
                        }

                        for (const update of updates) {
                            const address = await addresses.findOne({ address: update.address });

                            const receivedSum = Decimal(update.value);

                            let received = Decimal(address.received);
                            let balance = Decimal(address.balance);

                            received = received.plus(receivedSum).toString();
                            balance = balance.plus(receivedSum).toString();

                            await addresses.updateOne(
                                { address: update.address },
                                {
                                    $set: {
                                        received,
                                        balance
                                    }
                                },
                                { session }
                            );
                        }

                        // commiting the transaction
                        await session.commitTransaction();
                        session.endSession();
                    } catch (error) {
                        console.error(error);

                        // aborting the transaction
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