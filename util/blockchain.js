const validator = require('validator');
const { decimaljs } = require('./../config.js');
const Decimal = require('decimal.js-light');

Decimal.set({
    precision: decimaljs.precision,
    toExpNeg: decimaljs.toExpNeg,
});

const blockchain = {
    isHash(string) {
        return validator.isHash(string, 'sha256');
    },

    isInt(string) {
        return validator.isInt(string, { min: 0, max: Number.MAX_SAFE_INTEGER });
    },

    addressLength: 34,
    isAddress(string) {
        return validator.isAlphanumeric(string)
            && validator.isLength(string, { min: this.addressLength, max: this.addressLength });
    },

    // txs of a block
    setVoutsSum(txs) {
        for (let tx of txs) {
            let amount_out = Decimal(0);

            for (let vout of tx.vout) {
                vout_value = Decimal(vout.value.toFixed(8));
                amount_out = amount_out.plus(vout_value);
            }
            tx.amount_out = amount_out.toString();
        }
    },

    _findAndSum(array, address, value, tx) {
        let object = array.find(item => item.address === address);

        if (object === undefined) {
            array.push({
                address: address,
                value: value,
                time: tx.blocktime,
                txid: tx.txid
            });
        } else {
            let index = array.indexOf(object);
            const sum = Decimal(object.value).plus(Decimal(value));
            array.fill(object.value = sum.toString(), index, index++);
        }
    },

    // txs = txs collection, tx = tx object
    async getInputs(txs, tx) {
        let inputs = [];

        for (const v of tx.vin) {
            if (v.hasOwnProperty('coinbase')) {
                inputs.push(v);
            } else {
                const vin = await txs.findOne({ txid: v.txid });

                const address = vin.vout[v.vout].scriptPubKey.addresses[0];
                const value = vin.vout[v.vout].value.toString();

                this._findAndSum(inputs, address, value, tx);
            }
        }

        return inputs;
    },
    // tx = tx object
    getRecipients(tx) {
        let recipients = [];

        for (const vout of tx.vout) {
            // if (!(vout.scriptPubKey.type === 'nonstandard' || vout.scriptPubKey.type === 'nulldata')) {
            if (Array.isArray(vout.scriptPubKey.addresses)) {
                const address = vout.scriptPubKey.addresses[0];
                const value = vout.value.toString();

                this._findAndSum(recipients, address, value, tx)
            }
        }

        return recipients;
    }
}

module.exports = blockchain;
