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
    limit: 50,
    // CoinGecko API URL for price
    pricesUrl: 'https://api.coingecko.com/api/v3/simple/price?ids=verge&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true'
};

module.exports = config;
