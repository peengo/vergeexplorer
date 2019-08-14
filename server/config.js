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
        richlist: 50, // richlist limit
        address: 50, // transactions page limit on address page
        block: 50, // transactions page limit on block page
        tx: 50, // inputs and recipients page limit on tx page
        latest: 10 // latest n blocks & transactions on homepage
    }
};

module.exports = config;
