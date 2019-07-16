const { decimaljs } = require('./../config');
const Decimal = require('decimal.js-light');

Decimal.set({
    precision: decimaljs.precision,
    toExpNeg: decimaljs.toExpNeg
});

const VIN = 'vin',
    VOUT = 'vout',
    COINBASE = 'coinbase';

const blockchain = {
    hashRegExp: /^([A-Fa-f0-9]{64})$/,
    intRegExp: /^([0-9]{1,18})$/,
    addressRegExp: /^([A-Za-z0-9]{34})$/,

    isHash(string) {
        return this.hashRegExp.test(string);
    },

    isInt(string) {
        return this.intRegExp.test(string);
    },

    isAddress(string) {
        return this.addressRegExp.test(string);
    },

    // txs = txs array of a block
    setVoutsSum(transactions) {
        return transactions.map(tx => {
            tx.amountout = tx.vout.map(vout => vout.value).reduce((acc, cur) => {
                const accValue = Decimal(acc);
                const curValue = Decimal(cur);
                const sumValue = accValue.plus(curValue).toString();

                return sumValue;
            });

            tx.amountout = Decimal(tx.amountout).toString();

            return tx;
        });
    },

    // array = inputs or recipients, address & value & tx = current
    _findAndSum(array, address, value, tx) {
        const item = array.find(item => item.address === address);

        if (item === undefined) {
            array.push({
                address,
                value,
                time: tx.blocktime,
                txid: tx.txid
            });
        } else {
            const sum = Decimal(item.value).plus(Decimal(value));

            item.value = sum.toString();
        }
    },

    // tx = tx object, txs = txs collection, localTxs = txs within same block
    async getInputs(tx, txs, localTxs) {
        let inputs = [];

        for (const v of tx.vin) {
            if (v.hasOwnProperty(COINBASE)) {
                inputs.push(v);
            } else {
                let vin;

                vin = await txs.findOne({ txid: v.txid });

                if (!vin && localTxs) {
                    vin = localTxs.find(item => item.txid === v.txid);
                }

                // if (vin === undefined) {
                //     // throw { missingTx: v.txid };

                //     console.error('TX NOT FOUND:', v.txid);
                //     process.exit();
                // }

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
            if (Array.isArray(vout.scriptPubKey.addresses)) {
                const address = vout.scriptPubKey.addresses[0];
                const value = vout.value.toString();

                this._findAndSum(recipients, address, value, tx);
            }
        }

        return recipients;
    },

    sumAddressOffsets(txIOOffsets, blockIOOffsets) {
        for (const txIOOffset of txIOOffsets) {
            let io = blockIOOffsets.find(item => item.address === txIOOffset.address);

            if (io === undefined) {
                blockIOOffsets.push(txIOOffset);
            } else {
                io.received = Decimal(io.received).plus(txIOOffset.received).toString();
                io.sent = Decimal(io.sent).plus(txIOOffset.sent).toString();
            }
        }

        return blockIOOffsets;
    },

    calculateInsertBalances(addressInserts) {
        return addressInserts = addressInserts.map(insert => ({
            address: insert.address,
            sent: insert.sent,
            received: insert.received,
            balance: Decimal(insert.received).minus(Decimal(insert.sent)).toString()
        }));
    },

    calculateUpdateBalances(addressUpdatesDb, addressUpdates) {
        return addressUpdatesDb.map((item, index) => ({
            address: item.address,
            sent: Decimal(item.sent).plus(Decimal(addressUpdates[index].sent)).toString(),
            received: Decimal(item.received).plus(Decimal(addressUpdates[index].received)).toString(),
            balance: Decimal(item.balance).plus(Decimal(addressUpdates[index].received)).minus(Decimal(addressUpdates[index].sent)).toString()
        }));
    },

    calculateUpdateInvalidBalances(addressUpdatesDb, addressUpdates) {
        return addressUpdatesDb.map((item, index) => ({
            address: item.address,
            sent: Decimal(item.sent).minus(Decimal(addressUpdates[index].sent)).toString(),
            received: Decimal(item.received).minus(Decimal(addressUpdates[index].received)).toString(),
            balance: Decimal(item.balance).minus(Decimal(addressUpdates[index].received)).plus(Decimal(addressUpdates[index].sent)).toString()
        }));
    },

    // array = inputs / recipients, tx = transaction, type = vin / vout
    _getIOInserts(array, tx, type) {
        return array.map(({ address, value, time }) => ({
            txid: tx.txid,
            address,
            type,
            value,
            time
        }));
    },

    findAndUpdateOffsets(offsets) {
        let txIOOffsets = [];

        for (const offset of offsets) {
            let io = txIOOffsets.find(item => item.address === offset.address);

            if (io === undefined) {
                switch (offset.type) {
                    case VIN:
                        txIOOffsets.push({
                            address: offset.address,
                            received: '0',
                            sent: Decimal(offset.value).toString()
                        });
                        break;
                    case VOUT:
                        txIOOffsets.push({
                            address: offset.address,
                            received: Decimal(offset.value).toString(),
                            sent: '0'
                        });
                        break;
                    default:
                        break;
                }
            } else {
                switch (offset.type) {
                    case VIN:
                        io.sent = Decimal(io.sent).plus(offset.value).toString();
                        break;
                    case VOUT:
                        io.received = Decimal(io.received).plus(offset.value).toString();
                        break;
                    default:
                        break;
                }
            }
        }

        return txIOOffsets;
    },

    // tx = tx object, txs = txs collection, localTxs = txs within same block
    async getIOInsertsAndOffsets(tx, txs, localTxs) {
        const inputs = await this.getInputs(tx, txs, localTxs);
        const recipients = this.getRecipients(tx);

        let vinTxInserts = [];

        if (!inputs[0].hasOwnProperty(COINBASE)) {
            vinTxInserts = this._getIOInserts(inputs, tx, VIN);
        }

        const voutTxInserts = this._getIOInserts(recipients, tx, VOUT);
        const addressTxInserts = [...vinTxInserts, ...voutTxInserts];
        const txIOOffsets = this.findAndUpdateOffsets(addressTxInserts);

        return {
            addressTxInserts,
            txIOOffsets
        };
    }
};

module.exports = blockchain;
