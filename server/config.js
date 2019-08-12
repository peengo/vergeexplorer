const config = {
    // db collection names
    collections: {
        blocks: 'blocks',
        txs: 'txs', // transactions
        ios: 'ios', // inputs & outputs
        addresses: 'addresses'
    },
    // for decimal.js-light
    // DON'T CHANGE!
    decimaljs: {
        toExpNeg: -10,
        precision: 30
    },
    // limit for pagers, peers, richlist...
    limit: 50,
    limits: {
        richlist: 50, // richlist addresses
        address: 50, // address tranasaction
        block: 50, // block transactions
        latest: 10 // latest n blocks & transactions on homepage
    }
};

module.exports = config;
