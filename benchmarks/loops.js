require('dotenv').config();

const config = require('../config');
const dbConnect = require('../db/connect');
const blockchain = require('../utils/blockchain');

(async () => {
    try {
        const db = await dbConnect(config.collections);

        const fromHeight = 0;
        const toHeight = 10000;

        console.log('looping...');

        let allInputs = [],
            allRecipients = [];

        console.time('for');
        for (let height = fromHeight; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (let index = 0; index < block.tx.length; index++) {
                const txid = block.tx[index];

                const tx = await db.txs.findOne({ txid });

                const [inputs, recipients] = await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);

                allInputs.push(inputs);
                allRecipients.push(recipients);
            }
        }
        console.log('records:', allInputs.length + allRecipients.length);
        console.timeEnd('for');

        allInputs.length = 0;
        allRecipients.length = 0;

        console.time('for of Promise.all');
        for (let height = fromHeight; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (const txid of block.tx) {
                const tx = await db.txs.findOne({ txid });

                const [inputs, recipients] = await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);

                allInputs.push(inputs);
                allRecipients.push(recipients);
            }
        }
        console.log('records:', allInputs.length + allRecipients.length);
        console.timeEnd('for of Promise.all');

        allInputs.length = 0;
        allRecipients.length = 0;

        console.time('for of sequential');
        for (let height = fromHeight; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            for (const txid of block.tx) {
                const tx = await db.txs.findOne({ txid });

                const inputs = await blockchain.getInputs(db.txs, tx);
                const recipients = await blockchain.getRecipients(tx);

                allInputs.push(inputs);
                allRecipients.push(recipients);
            }
        }
        console.log('records:', allInputs.length + allRecipients.length);
        console.timeEnd('for of sequential');

        allInputs.length = 0;
        allRecipients.length = 0;

        console.time('for of Promise.all map');
        for (let height = fromHeight; height < toHeight; height++) {
            let block = await db.blocks.findOne({ height });

            await Promise.all(block.tx.map(async txid => {
                const tx = await db.txs.findOne({ txid });

                const [inputs, recipients] = await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);

                allInputs.push(inputs);
                allRecipients.push(recipients);
            }));
        }
        console.log('records:', allInputs.length + allRecipients.length);
        console.timeEnd('for of Promise.all map');

        console.log('#######################');

        allInputs.length = 0;
        allRecipients.length = 0;

        console.time('for of Promise.all no block');
        for (let height = fromHeight; height < toHeight; height++) {
            const transactions = await db.txs.find({ height }).toArray();

            for (const tx of transactions) {
                const [inputs, recipients] = await Promise.all([
                    blockchain.getInputs(db.txs, tx),
                    blockchain.getRecipients(tx)
                ]);

                allInputs.push(inputs);
                allRecipients.push(recipients);
            }
        }
        console.log('records:', allInputs.length + allRecipients.length);
        console.timeEnd('for of Promise.all no block');

        console.log('looping ended');

        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(0);
    }
})();