// Copyright (c) 2026 Verge
// Distributed under the MIT license. See LICENSE.

const bs58 = require('bs58');
const { createHash } = require('crypto');

function getPubKeyAddressPrefix(chain) {
    switch (chain) {
        case 'main': return 30;
        case 'test': return 115;
        case 'regtest': return 111;
        default: throw new Error(`Unsupported Verge network: ${chain}`);
    }
}

function getOutputAddress(scriptPubKey, prefix = 30) {
    if (!scriptPubKey) return null;

    if (Array.isArray(scriptPubKey.addresses) && scriptPubKey.addresses.length > 0) {
        return scriptPubKey.addresses[0];
    }
    if (typeof scriptPubKey.address === 'string' && scriptPubKey.address.length > 0) {
        return scriptPubKey.address;
    }
    if (typeof scriptPubKey.hex !== 'string') return null;

    // Only recognize the complete VPB1/VPU1 metadata + DROP + P2PKH templates.
    const match = /^(?:4c5956504201[0-9a-f]{170}|0856505501[0-9a-f]{8})7576a914([0-9a-f]{40})88ac$/i.exec(scriptPubKey.hex);

    if (!match) return null;

    const payload = Buffer.concat([Buffer.from([prefix]), Buffer.from(match[1], 'hex')]);

    const hash = createHash('sha256').update(payload).digest();
    const checksum = createHash('sha256').update(hash).digest().slice(0, 4);

    return bs58.encode(Buffer.concat([payload, checksum]));
}

module.exports = { getOutputAddress, getPubKeyAddressPrefix };
