'use strict';
const dbConnect = require('../db/connect');
const blockchain = require('../utils/blockchain');
const { promisify } = require('util');

const delay = promisify(setTimeout);

(async () => {
    try {
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

        const blockHash = process.argv[2];

        let session = client.startSession();

        session.startTransaction();
        try {
            console.log(`Removing Block: ${blockHash}`);
            await removeBlock(blockHash, { blocks, txs, ios, addresses, session });

            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            throw error;
        }
    } catch (error) {
        console.error(error);
    } finally {
        console.log('...Sleeping...');
        await delay(30000);
    }
})();

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
