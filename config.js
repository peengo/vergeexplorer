const config = {
    // db collection names
    col: {
        blocks: 'blocks',
        txs: 'txs',
        addresses: 'addr',
        address_txs: 'addr_txs',
        searches: 'search',
    },
    // regexp
    // regexp: {
    //     hash: /^([A-Fa-f0-9]{64})$/,    // for block hash and txid
    //     address: /^([A-Za-z0-9]{34})$/, // for address hash
    //     int: /^([0-9]{1,20})$/,         // for block index
    // },

    // for decimal.js-light
    // DON'T CHANGE!
    decimaljs: {
        toExpNeg: -10,  // The negative exponent value at and below which toString returns exponential notation.
        precision: 30,  // The maximum number of significant digits of the result of an operation.
    },
    // latest n blocks & transaction on homepage
    latest: 10,
    // limit for pagers, peers, richlist...
    limit: 50
}

module.exports = config;