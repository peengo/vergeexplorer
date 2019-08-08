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
        richlist: 50,
        address: 50,
        latest: 10 // latest n blocks & transactions on homepage
    }
};

module.exports = config;
