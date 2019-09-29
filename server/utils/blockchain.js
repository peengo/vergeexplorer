const { decimaljs } = require('./../config');
const Decimal = require('decimal.js-light');

Decimal.set({
    precision: decimaljs.precision,
    toExpNeg: decimaljs.toExpNeg
});

const VIN = 'vin',
    VOUT = 'vout',
    COINBASE = 'coinbase',
    BOTH = 'both';

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
        return addressInserts = addressInserts.map(({ address, received, sent }) => {

            const dReceived = Decimal(received);
            const dSent = Decimal(sent);
            const dBalance = dReceived.minus(dSent);
            const balance = dBalance.toString();

            if (dBalance.isNegative()) {
                console.log('calculateInsertBalances negative balance', address);
                console.log('received:', dReceived.toString());
                console.log('sent:', dSent.toString());
                console.log('balance:', balance);
                process.exit();
            }

            return {
                address,
                sent,
                received,
                balance
            };
        });
    },

    calculateUpdateBalances(addressUpdatesDb, addressUpdates) {
        return addressUpdatesDb.map((item, index) => {
            if (addressUpdatesDb.length != addressUpdates.length) {
                console.log('calculateUpdateBalances lengths do not match');
                process.exit();
            }

            if (item.address !== addressUpdates[index].address) {
                console.log('calculateUpdateBalances addresses do not match', item.address, addressUpdates[index].address);
                process.exit();
            }

            const dItemSent = Decimal(item.sent);
            const dUpdatesSent = Decimal(addressUpdates[index].sent);
            const dSent = dItemSent.plus(dUpdatesSent);
            const sent = dSent.toString();

            const dItemReceived = Decimal(item.received);
            const dUpdatesReceived = Decimal(addressUpdates[index].received);
            const dReceived = dItemReceived.plus(dUpdatesReceived);
            const received = dReceived.toString();

            const dItemBalance = Decimal(item.balance);
            const dBalance = dItemBalance.plus(dUpdatesReceived).minus(dUpdatesSent);
            const balance = dBalance.toString();

            if (dSent.isNegative() || dReceived.isNegative() || dBalance.isNegative()) {
                console.log('calculateUpdateBalances negative balance', item.address);
                console.log('sent:', sent);
                console.log('received:', received);
                console.log('balance:', balance);
                process.exit();
            }

            if (!(dReceived.minus(dSent).equals(dBalance.toString()))) {
                console.log('calculateUpdateBalances wrong caluclation');
                process.exit();
            }

            return {
                address: item.address,
                sent,
                received,
                balance
            };
        });
    },

    calculateUpdateInvalidBalances(addressUpdatesDb, addressUpdates) {
        return addressUpdatesDb.map((item, index) => {
            if (addressUpdatesDb.length != addressUpdates.length) {
                console.log('calculateUpdateInvalidBalances lengths do not match');
                process.exit();
            }

            if (item.address !== addressUpdates[index].address) {
                console.log('calculateUpdateInvalidBalances addresses do not match', item.address, addressUpdates[index].address);
                process.exit();
            }

            const dItemSent = Decimal(item.sent);
            const dUpdatesSent = Decimal(addressUpdates[index].sent);
            const dSent = dItemSent.minus(dUpdatesSent);
            const sent = dSent.toString();

            const dItemReceived = Decimal(item.received);
            const dUpdatesReceived = Decimal(addressUpdates[index].received);
            const dReceived = dItemReceived.minus(dUpdatesReceived);
            const received = dReceived.toString();

            const dItemBalance = Decimal(item.balance);

            const dBalance = dItemBalance.minus(dUpdatesReceived).plus(dUpdatesSent);
            const balance = dBalance.toString();

            if (dSent.isNegative() || dReceived.isNegative() || dBalance.isNegative()) {
                console.log('calculateUpdateInvalidBalances negative balance', item.address);
                console.log('sent:', sent);
                console.log('received:', received);
                console.log('balance:', balance);

                process.exit();
            }

            if (!(dReceived.minus(dSent).equals(dBalance.toString()))) {
                console.log('calculateUpdateInvalidBalances wrong caluclation');
                process.exit();
            }

            return {
                address: item.address,
                sent,
                received,
                balance
            };
        });
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
    },

    // values = [ {type: 'vin', value}, {type: 'vout', value } ]
    getIOsValuesDiff(values) {
        let type, value;

        if (values.length == 2) {
            const vin = values.find(item => item.type === VIN);
            const vout = values.find(item => item.type === VOUT);

            type = BOTH;
            value = Decimal(vout.value).minus(Decimal(vin.value)).toString();
        } else {
            type = values[0].type;
            value = values[0].value;
        }

        return { type, value };
    }
};

module.exports = blockchain;
