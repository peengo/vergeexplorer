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
    // latest n blocks & transactions on homepage
    latest: 10,
    // limit for pagers, peers, richlist...
    limit: 50
};

module.exports = config;
