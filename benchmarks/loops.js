require('dotenv').config();

const config = require('../config');
const dbConnect = require('../db/connection');
const blockchain = require('../utils/blockchain');

(async () => {
    try {
        const db = await dbConnect(config.collections);

        const toHeight = 10000;

        console.log('looping...');

        console.time('for');
        for (let height = 1; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (let index = 0; index < block.tx.length; index++) {
                const txid = block.tx[index];

                const tx = await db.txs.findOne({ txid });

                await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);
            }
        }
        console.timeEnd('for');

        console.time('for of Promise.all');
        for (let height = 1; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (const txid of block.tx) {
                const tx = await db.txs.findOne({ txid });

                await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);
            }
        }
        console.timeEnd('for of Promise.all');

        console.time('for of sequential');
        for (let height = 1; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (const txid of block.tx) {
                const tx = await db.txs.findOne({ txid });

                await blockchain.getInputs(db.txs, tx);
                await blockchain.getRecipients(tx);
            }
        }
        console.timeEnd('for of sequential');

        console.log('looping ended');

        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(0);
    }
})();