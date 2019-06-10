const { decimaljs } = require('./../config.js');
const Decimal = require('decimal.js-light');

Decimal.set({
    precision: decimaljs.precision,
    toExpNeg: decimaljs.toExpNeg
});

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
            tx.amount_out = tx.vout.map(vout => vout.value).reduce((acc, cur) => {
                const accValue = Decimal(acc);
                const curValue = Decimal(cur);
                const sumValue = accValue.plus(curValue).toString();

                return sumValue;
            });

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

    // tx = tx object, txs = txs collection
    async getInputs(tx, txs, localTransactions) {
        let inputs = [];

        for (const v of tx.vin) {
            if (v.hasOwnProperty('coinbase')) {
                inputs.push(v);
            } else {
                let vin;

                vin = await txs.findOne({ txid: v.txid });

                if (!vin && localTransactions) {
                    vin = localTransactions.find(item => item.txid === v.txid);
                }

                if (vin === undefined) {
                    console.error('TX NOT FOUND');
                    process.exit();
                }

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

    _getIOInserts(array, tx, type) {
        return array.map(({ address, value, time }) => ({
            txid: tx.txid,
            address,
            type,
            value,
            time
        }));
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

    // tx = tx object, txs = txs collection, localTransactions = txs within same block
    async getIOInsertsAndOffsets(tx, txs, localTransactions) {
        const inputs = await this.getInputs(tx, txs, localTransactions);
        const recipients = this.getRecipients(tx);

        let vinTxInserts = [], txIOOffsets = [];

        if (!inputs[0].hasOwnProperty('coinbase')) {
            vinTxInserts = this._getIOInserts(inputs, tx, 'vin');
        }

        const voutTxInserts = this._getIOInserts(recipients, tx, 'vout');

        const addressTxInserts = [...vinTxInserts, ...voutTxInserts];

        for (const txInsert of addressTxInserts) {
            let io = txIOOffsets.find(offset => offset.address === txInsert.address);

            if (io === undefined) {
                switch (txInsert.type) {
                    case 'vin':
                        txIOOffsets.push({
                            address: txInsert.address,
                            received: '0',
                            sent: Decimal(txInsert.value).toString()
                        });
                        break;
                    case 'vout':
                        txIOOffsets.push({
                            address: txInsert.address,
                            received: Decimal(txInsert.value).toString(),
                            sent: '0'
                        });
                        break;
                    default:
                        break;
                }
            } else {
                switch (txInsert.type) {
                    case 'vin':
                        io.sent = Decimal(io.sent).plus(txInsert.value).toString();
                        break;
                    case 'vout':
                        io.received = Decimal(io.received).plus(txInsert.value).toString();
                        break;
                    default:
                        break;
                }
            }
        }

        return {
            addressTxInserts,
            txIOOffsets
        };
    },

    _findAndUpdateOffsets(array, offsets) {
        for (const offset of offsets) {
            const item = array.find(array => array.address === offset.address);

            if (item === undefined) {
                array.push(offset);
            } else {
                item.value = Decimal(item.value).plus(Decimal(offset.value)).toString();
            }
        }

        return array;
    }
};

module.exports = blockchain;
