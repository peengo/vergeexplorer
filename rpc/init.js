require('dotenv').config();
const Rpc = require('../utils/rpc');

const rpcInit = async () => {
    try {
        const rpc = new Rpc(
            `http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`,
            ['getinfo', 'getpeerinfo', 'getblockbynumber', 'getblock', 'getblockcount', 'getblockhash', 'getrawtransaction']
        );

        return rpc;
    } catch (error) {
        throw error.message;
    }
};

module.exports = rpcInit;
