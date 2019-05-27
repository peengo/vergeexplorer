require('dotenv').config();

const rpcInit = require('../rpc/init');

(async () => {
    try {
        const rpc = await rpcInit();

        console.time('loop');
        for (let height = 0; height < 10; height++) {
            const { result: block } = await rpc.getblockbynumber([height, true]);

            for (const tx of block.tx) {
                console.log(tx.txid);
            }
        }
        console.timeEnd('loop');
    } catch (error) {
        console.error(error);
    }
})();