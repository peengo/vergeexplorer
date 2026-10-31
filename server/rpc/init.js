require('dotenv').config();
const Rpc = require('../utils/rpc');
const blockchain = require('../utils/blockchain');
const { getPubKeyAddressPrefix } = require('../utils/scriptAddress');

const rpcInit = async () => {
    try {
        const rpc = new Rpc(
            `http://${process.env.RPC_USER}:${process.env.RPC_PASS}@${process.env.RPC_HOST}:${process.env.RPC_PORT}`,
            [
                'getTxOutSetInfo',
                'getPeerInfo',
                'getBlockCount',
                'getBlockHash',
                'getBlock',
                'getBlockchainInfo',
                'getRawTransaction',
                'getNetworkInfo',
                'getRawMempool',
                'getDifficulty'
            ]
        );

        const { result, error } = await rpc.getBlockchainInfo();

        if (error) throw new Error(error.message);

        blockchain.pubKeyAddressPrefix = getPubKeyAddressPrefix(result.chain);

        return rpc;
    } catch (error) {
        throw error.message;
    }
};

module.exports = rpcInit;
