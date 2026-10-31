// Copyright (c) 2026 Verge
// Distributed under the MIT license. See LICENSE.

const assert = require('assert');
const blockchain = require('../utils/blockchain');
const { getOutputAddress, getPubKeyAddressPrefix } = require('../utils/scriptAddress');

// Real bond from height 2484, spent by the unbond transaction at height 3366.
const bondHex = '4c5956504201991d8c083949a6d821fc578c1c44266c014b69e89f044d8a9175a3e2490a331002617ed0ee36c78a9c757da985d0e37f89cb845354e9ffb4998540eced137ad3784510a5c2213482cdfc9b0941b440eb050e5d1a1c7576a914a3705046d896fce8543b93d00606d0dfd87baaac88ac';
const unbondHex = '0856505501e65b00007576a914a3705046d896fce8543b93d00606d0dfd87baaac88ac';
const changeAddress = 'oWJn2U6t4BfvCcTQE4WbiHTBFo8nsbZfX5';
const fundingAddress = 'oLVv1bp3pnzuC2hXZz5MJxiyneDyT1W3sz';

function output(value, scriptPubKey) {
    return { value, scriptPubKey };
}

function metadataOutput(value, hex) {
    return output(value, { type: 'nonstandard', hex });
}

function addressOutput(value, address) {
    return output(value, { type: 'pubkeyhash', addresses: [address] });
}

function collection(transactions) {
    return { findOne: async ({ txid }) => transactions.find(tx => tx.txid === txid) };
}

describe('Transaction address accounting', () => {
    afterEach(() => {
        blockchain.pubKeyAddressPrefix = 30;
    });

    it('selects the daemon network and rejects unknown networks', () => {
        assert.strictEqual(getPubKeyAddressPrefix('main'), 30);
        assert.strictEqual(getPubKeyAddressPrefix('test'), 115);
        assert.strictEqual(getPubKeyAddressPrefix('regtest'), 111);
        assert.throws(() => getPubKeyAddressPrefix('unknown'), /Unsupported Verge network/);
    });

    it('preserves legacy mainnet address fields, including script-hash outputs', async () => {
        const address = 'DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w';
        const scriptAddress = 'legacy-script-hash-address';
        const parent = { txid: 'parent', vout: [addressOutput(50, address)] };
        const tx = {
            txid: 'transfer', blocktime: 1, vin: [{ txid: 'parent', vout: 0 }],
            vout: [addressOutput(20, scriptAddress), addressOutput(29.9, address)]
        };
        const { txIOOffsets } = await blockchain.getIOInsertsAndOffsets(tx, collection([parent]));

        assert.deepStrictEqual(txIOOffsets, [
            { address, received: '29.9', sent: '50' },
            { address: scriptAddress, received: '20', sent: '0' }
        ]);
        assert.strictEqual(getOutputAddress({ addresses: [address], hex: bondHex }, 115), address);
        assert.strictEqual(getOutputAddress({ address }), address);
    });

    it('retains coinbase payouts and ignores null-data PoS commitments', async () => {
        const address = 'DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w';
        const tx = {
            txid: 'coinbase', blocktime: 1, vin: [{ coinbase: '00' }],
            vout: [addressOutput(0.1, address), output(0, { type: 'nulldata', hex: '6a0456504301' })]
        };
        const { addressTxInserts, txIOOffsets } = await blockchain.getIOInsertsAndOffsets(tx, collection([]));

        assert.strictEqual(addressTxInserts.length, 1);
        assert.deepStrictEqual(txIOOffsets, [{ address, received: '0.1', sent: '0' }]);
    });

    it('decodes bond and unbond withdrawal addresses using network-specific prefixes', () => {
        const main = getOutputAddress({ hex: bondHex }, 30);
        const test = getOutputAddress({ hex: bondHex }, 115);
        const regtest = getOutputAddress({ hex: bondHex }, 111);

        assert.strictEqual(main[0], 'D');
        assert.strictEqual(test[0], 'o');
        assert.strictEqual(test, 'oXmYvSYGeDcMzTQKeRHkecbLCXAQVFeHse');
        assert.notStrictEqual(main, test);
        assert.notStrictEqual(regtest, test);
        assert.strictEqual(getOutputAddress({ hex: unbondHex }, 30), main);
        assert.strictEqual(getOutputAddress({ hex: unbondHex }, 115), test);
        assert.strictEqual(getOutputAddress({ hex: bondHex.toUpperCase() }, 115), test);
    });

    it('rejects unrelated, truncated and incorrectly framed metadata scripts', () => {
        const scripts = [
            bondHex.slice(0, -2), `${bondHex}00`,
            bondHex.replace('4c59', '4c58'), bondHex.replace('56504201', '56504202'),
            unbondHex.replace('08565055', '09565055'), unbondHex.replace('7576a914', '7676a914'),
            unbondHex.replace('56505501', '56505502'),
            '76a914a3705046d896fce8543b93d00606d0dfd87baaac88ac', '6a0456504301'
        ];

        for (const hex of scripts) {
            assert.strictEqual(getOutputAddress({ hex }), null, hex);
        }
        assert.strictEqual(getOutputAddress({ addresses: [] }), null);
        assert.strictEqual(getOutputAddress(null), null);
        assert.strictEqual(getOutputAddress({ hex: 'not hex' }), null);
    });

    it('accounts for bond creation, the height-3366 unbond, and withdrawal', async () => {
        blockchain.pubKeyAddressPrefix = 115;
        const withdrawalAddress = getOutputAddress({ hex: bondHex }, 115);
        const funding = {
            txid: 'funding', vout: [addressOutput(11200001.5, fundingAddress)]
        };
        const bond = {
            txid: '40d94fb0324471e4fe046418e1497940fa33bcac3c04bebc7d5def846f6dd00f',
            blocktime: 1, vin: [{ txid: 'funding', vout: 0 }],
            vout: [metadataOutput(11200001.4, bondHex)]
        };
        const feeParent = {
            txid: 'fc9baaeb6e79507aa695c7d90cb4022efdacd48e4d172ab7203429a2d6fae7bb',
            vout: [metadataOutput(12400000.2, bondHex), addressOutput(5000000, changeAddress)]
        };
        const unbond = {
            txid: '807dd3ccbab9a91549cb30340f98075e10a796b7c0ecebf719a5ec62cfba9f01',
            blocktime: 2,
            vin: [{ txid: bond.txid, vout: 0 }, { txid: feeParent.txid, vout: 1 }],
            vout: [metadataOutput(11200001.4, unbondHex), addressOutput(4999999.9, changeAddress)]
        };
        const db = collection([funding, bond, feeParent]);
        const created = await blockchain.getIOInsertsAndOffsets(bond, db);
        const unbonded = await blockchain.getIOInsertsAndOffsets(unbond, db);
        const withdrawal = {
            txid: 'withdrawal', blocktime: 3, vin: [{ txid: unbond.txid, vout: 0 }],
            vout: [addressOutput(11200001.3, fundingAddress)]
        };
        const withdrawn = await blockchain.getIOInsertsAndOffsets(withdrawal, collection([]), [unbond]);

        assert.deepStrictEqual(created.txIOOffsets, [
            { address: fundingAddress, received: '0', sent: '11200001.5' },
            { address: withdrawalAddress, received: '11200001.4', sent: '0' }
        ]);
        assert.deepStrictEqual(unbonded.txIOOffsets, [
            { address: withdrawalAddress, received: '11200001.4', sent: '11200001.4' },
            { address: changeAddress, received: '4999999.9', sent: '5000000' }
        ]);
        assert.deepStrictEqual(withdrawn.txIOOffsets, [
            { address: withdrawalAddress, received: '0', sent: '11200001.4' },
            { address: fundingAddress, received: '11200001.3', sent: '0' }
        ]);

        const balance = blockchain.calculateInsertBalances([created.txIOOffsets[1]])[0];
        const afterUnbond = blockchain.calculateUpdateBalances([balance], [unbonded.txIOOffsets[0]])[0];
        const afterWithdrawal = blockchain.calculateUpdateBalances([afterUnbond], [withdrawn.txIOOffsets[0]])[0];

        assert.strictEqual(afterUnbond.balance, '11200001.4');
        assert.strictEqual(afterWithdrawal.balance, '0');
        const rolledBack = blockchain.calculateUpdateInvalidBalances([afterWithdrawal], [withdrawn.txIOOffsets[0]])[0];

        assert.strictEqual(rolledBack.balance, afterUnbond.balance);
    });

    it('handles addressless inputs without indexing undefined addresses', async () => {
        const parent = { txid: 'parent', vout: [output(0, { type: 'nonstandard', hex: '51' })] };
        const tx = { txid: 'spend', blocktime: 1, vin: [{ txid: 'parent', vout: 0 }], vout: [] };
        const result = await blockchain.getIOInsertsAndOffsets(tx, collection([parent]));

        assert.deepStrictEqual(result, { addressTxInserts: [], txIOOffsets: [] });
    });

    it('reports missing previous transactions or outputs instead of silently skipping them', async () => {
        const tx = { vin: [{ txid: 'missing', vout: 1 }] };

        await assert.rejects(blockchain.getInputs(tx, collection([])), /Missing previous output missing:1/);
        await assert.rejects(blockchain.getInputs(tx, collection([{ txid: 'missing', vout: [] }])), /Missing previous output missing:1/);
    });
});
