'use strict';
const dbConnect = require('../db/connect');

/*
    This script is for searching strings in the decoded coinbase signatures.

    Run from the server folder:
    node scripts/coinbase.js '["searchTerm", "anotherSearchTerm" ...]' startHeight stopHeight

    EXAMPLE:
    node scripts/coinbase.js '["ant","dutch"]' 3000000 3000010
*/

const args = process.argv.slice(2);

const SEARCH = (args[0]) ? JSON.parse(args[0]) : ['ant', 'dutch'];
const START = parseInt(args[1]) || 3000000;
const STOP = parseInt(args[2]) || 3000010;

(async () => {
    try {
        const { collections: { blocks } } = await dbConnect();

        for (let height = START; height <= STOP; height++) {
            let block = await blocks.aggregate([
                { $match: { height } },
                {
                    $lookup: {
                        from: 'txs',
                        localField: 'tx',
                        foreignField: 'txid',
                        as: 'txs'
                    }
                }
            ]).toArray();

            const hex = block[0].txs[0].vin[0].coinbase;

            const coinbase = {
                hex,
                decoded: decodeCoinbase(hex),
                decodedLowercase: decodeCoinbase(hex).toLowerCase()
            };

            for (const searchTerm of SEARCH) {
                if (coinbase.decodedLowercase.includes(searchTerm)) {
                    console.log(`\x1b[32m${height}\x1b[0m | ${coinbase.decoded}`);
                }
            }
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit();
    }
})();

function decodeCoinbase(coinbaseHex) {
    const hex = String(coinbaseHex);
    let str = '';

    // convert from hex to ascii
    for (var n = 0; n < hex.length; n += 2)
        str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));

    return str;
}
