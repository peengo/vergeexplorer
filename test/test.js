require('dotenv').config();

const chai = require('chai');
const { expect } = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const url = 'http://localhost';
const port = process.env.PORT;

const app = chai.request(`${url}:${port}`);

const contentType = 'application/json; charset=utf-8';

describe('API Tests', () => {
    describe('GET', () => {
        describe('/', () => {
            it('should return 404', async () => {
                try {
                    const res = await app.get('/');

                    expect(res).to.have.status(404);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('status');
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/info', function () {
            this.timeout(5000);
            it('should return info', async () => {
                try {
                    const res = await app.get('/info');

                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.have.property('blocks_db').to.be.a('number');
                    expect(res.body.data).to.have.property('blocks_rpc').to.be.a('number');
                    expect(res.body.data).to.have.property('moneysupply').to.be.a('number');
                    expect(res.body.data).to.have.property('paytxfee').to.be.a('number');
                    expect(res.body.data).to.have.property('price').to.be.an('object');
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/peers', function () {
            it('should return peers', async () => {
                try {
                    const res = await app.get('/peers');

                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                    expect(res.body.data[0]).to.have.property('addr').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('conntime').to.be.a('number');
                    expect(res.body.data[0]).to.have.property('version').to.be.a('number');
                    expect(res.body.data[0]).to.have.property('subver').to.be.a('string');
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/richlist', () => {
            it('should return a richlist', async () => {
                try {
                    const res = await app.get('/richlist');

                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                    expect(res.body.data[0]).to.have.property('address').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('sent').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('received').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('balance').to.be.a('string');
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/latest/blocks', () => {
            it('should return latest blocks', async () => {
                try {
                    const res = await app.get('/latest/blocks');

                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                    expect(res.body.data[0]).to.have.property('hash').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('height').to.be.a('number');
                    expect(res.body.data[0]).to.have.property('time').to.be.a('number');
                    expect(res.body.data[0].tx).to.be.an('array');
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/latest/txs', () => {
            it('should return latest txs', async () => {
                try {
                    const res = await app.get('/latest/txs');

                    expect(res).to.have.status(200);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('data');
                    expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                    expect(res.body.data[0]).to.have.property('txid').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('time').to.be.a('number');
                    expect(res.body.data[0]).to.have.property('blockhash').to.be.a('string');
                    expect(res.body.data[0]).to.have.property('height').to.be.a('number');
                    expect(res.body.data[0]).to.have.property('amount_out').to.be.a('string');
                    expect(res.body.data[0].vin).to.be.an('array').to.have.lengthOf.above(0);
                    expect(res.body.data[0].vout).to.be.an('array').to.have.lengthOf.above(0);
                } catch (error) {
                    throw error;
                }
            });
        });

        describe('/latest/1', () => {
            it('should return invalid parameter', async () => {
                try {
                    const res = await app.get('/latest/1');

                    expect(res).to.have.status(400);
                    expect(res).to.have.header('content-type', contentType);
                    expect(res).to.be.json;
                    expect(res.body).to.have.property('error');
                } catch (error) {
                    throw error;
                }
            });
        });


        describe('BLOCK', () => {
            describe('/block/00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278', () => {
                it('should return genesis block', async () => {
                    try {
                        const res = await app.get('/block/00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.include({
                            hash: '00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278',
                            height: 0
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/block/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00', () => {
                it('should return block not found from the RPC', async () => {
                    try {
                        const res = await app.get('/block/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00');

                        expect(res).to.have.status(404);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/block/1', () => {
                it('should return an error block not found', async () => {
                    try {
                        const res = await app.get('/block/1');

                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/block/txs/1b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/0', () => {
                it('should return block transactions with 0 offset', async () => {
                    try {
                        const res = await app.get('/block/txs/1b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body).to.include({ total: 11 });
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(11);
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/block/txs/1b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/5', () => {
                it('should return block transactions with 5 offset', async () => {
                    try {
                        const res = await app.get('/block/txs/1b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/5');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body).to.include({ total: 11 });
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(6);
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/block/txs/2b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/0', () => {
                it('should return block not found', async () => {
                    try {
                        const res = await app.get('/block/txs/2b94b012596e52ce78923ce4947acbdc6172f7664f721a35b687cb898eb0b987/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                    } catch (error) {
                        throw error;
                    }
                });
            });
        });


        describe('TXS', () => {
            describe('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00', () => {
                it('should return genesis tx', async () => {
                    try {
                        const res = await app.get('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.include({
                            txid: '1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00',
                            height: 0
                        });
                        expect(res.body.data.vin).to.be.an('array').to.have.lengthOf.above(0);
                        expect(res.body.data.vout).to.be.an('array').to.have.lengthOf.above(0);
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd01', () => {
                it('should return transaction not found', async () => {
                    try {
                        const res = await app.get('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd01');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/1', () => {
                it('should return not a valid txid', async () => {
                    try {
                        const res = await app.get('/tx/1');

                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/inputs/24b6654cb4711fc4704dcc67175a9be9d0f740fb30c983a4266f981ff25225e3/0', () => {
                it('should return first 50 inputs', async () => {
                    try {
                        const res = await app.get('/tx/inputs/24b6654cb4711fc4704dcc67175a9be9d0f740fb30c983a4266f981ff25225e3/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('total');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(50);
                        expect(res.body.data[49]).to.include({
                            value: '542.846996',
                            address: 'DDKjQRBuXN7wJQRD1hWpq7MBTMZmnkqqEd'
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/inputs/24b6654cb4711fc4704dcc67175a9be9d0f740fb30c983a4266f981ff25225e3/50', () => {
                it('should return the last 23 inputs', async () => {
                    try {
                        const res = await app.get('/tx/inputs/24b6654cb4711fc4704dcc67175a9be9d0f740fb30c983a4266f981ff25225e3/50');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('total');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(23);
                        expect(res.body.data[22]).to.include({
                            value: '272',
                            address: 'DQmraiVhekqtveon7rodEWQevkx5YcE11B'
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/recipients/4b1073b7f44d48d911b5fee478cd01225d8284a1ae036c2d43364b311309e41b/0', () => {
                it('should return first 50 recipients', async () => {
                    try {
                        const res = await app.get('/tx/recipients/4b1073b7f44d48d911b5fee478cd01225d8284a1ae036c2d43364b311309e41b/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('total');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(50);
                        expect(res.body.data[49]).to.include({
                            address: 'DRYaGhvaytXzBtB6EACt4hvYsMvgjTAFW3',
                            value: '419.820942'
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/tx/recipients/4b1073b7f44d48d911b5fee478cd01225d8284a1ae036c2d43364b311309e41b/300', () => {
                it('should return last 16 recipients', async () => {
                    try {
                        const res = await app.get('/tx/recipients/4b1073b7f44d48d911b5fee478cd01225d8284a1ae036c2d43364b311309e41b/300');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('total');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(16);
                        expect(res.body.data[15]).to.include({
                            address: 'DM9wMzi2Eyjh6V3v1S1ceApBhMw3Zk6Ym8',
                            value: '0.142129'
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });
        });


        describe('ADDRESS', () => {
            describe('/address/DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w', () => {
                it('should return address info', async () => {
                    try {
                        const res = await app.get('/address/DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body.data).to.have.property('address').to.be.a('string');
                        expect(res.body.data).to.have.property('sent').to.be.a('string');
                        expect(res.body.data).to.have.property('received').to.be.a('string');
                        expect(res.body.data).to.have.property('balance').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/address/AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1a', () => {
                it('should return address not found', async () => {
                    try {
                        const res = await app.get('/address/AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1a');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/address/1', () => {
                it('should return not a valid address', async () => {
                    try {
                        const res = await app.get('/address/1');

                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/address/txs/DB5MvtQaEY1JfCYLKWtL4XqRKt54y7GX4j/0', () => {
                it('should return latest transactions of the address', async () => {
                    try {
                        const res = await app.get('/address/txs/DB5MvtQaEY1JfCYLKWtL4XqRKt54y7GX4j/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                        expect(res.body.data[0]).to.have.property('txid').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('type').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('value').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('time').to.be.a('number');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/address/txs/DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w/50', () => {
                it('should return latest transactions of the address', async () => {
                    try {
                        const res = await app.get('/address/txs/DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w/50');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                        expect(res.body.data[39]).to.include({
                            txid: '5418ac98015b3fd202253597bd3c5dd5733d851439f09b8913abe9216059a9ef'
                        });
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/address/txs/AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w/0', () => {
                it('should return latest transactions of the address', async () => {
                    try {
                        const res = await app.get('/address/txs/AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w/0');

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

        });


        describe('SEARCH', () => {
            describe('/search { "search": "1" }', () => {
                it('should return the block with height 1 redirect data', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: '1' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data').to.be.an('object');
                        expect(res.body.data).to.have.property('redirect').to.be.a('string');
                        expect(res.body.data).to.have.property('hash').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "50000000000" }', () => {
                it('should return block not found', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: '50000000000' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w" }', () => {
                it('should return the address redirect data', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: 'DURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data').to.be.an('object');
                        expect(res.body.data).to.have.property('redirect').to.be.a('string');
                        expect(res.body.data).to.have.property('address').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w" }', () => {
                it('should return the address not found', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: 'AURWKj2AB9pWvjyH8Jj5BAvEaDRZnTzJ1w' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "000007342680f4a3d7a3d34a9214b5b71c6f1bec3d633d6d2b84d474a6be55fd" }', () => {
                it('should return the block with height 1 redirect data', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: '000007342680f4a3d7a3d34a9214b5b71c6f1bec3d633d6d2b84d474a6be55fd' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data').to.be.an('object');
                        expect(res.body.data).to.have.property('redirect').to.be.a('string');
                        expect(res.body.data).to.have.property('hash').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "5418ac98015b3fd202253597bd3c5dd5733d851439f09b8913abe9216059a9ef" }', () => {
                it('should return the tx with redirect data', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: '5418ac98015b3fd202253597bd3c5dd5733d851439f09b8913abe9216059a9ef' });

                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data').to.be.an('object');
                        expect(res.body.data).to.have.property('redirect').to.be.a('string');
                        expect(res.body.data).to.have.property('txid').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search { "search": "9418ac98015b3fd202253597bd3c5dd5733d851439f09b8913abe9216059a9ef" }', () => {
                it('should return block / tx not found', async () => {
                    try {
                        const res = await app.get('/search')
                            .send({ search: '9418ac98015b3fd202253597bd3c5dd5733d851439f09b8913abe9216059a9ef' });

                        expect(res).to.have.status(404);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search "s: s"', () => {
                it('should return not a valid JSON error', async () => {
                    try {
                        const res = await app.get('/search')
                            .send('s: s');

                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

            describe('/search', () => {
                it('should return invalid search parameter', async () => {
                    try {
                        const res = await app.get('/search');

                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error').to.be.a('string');
                    } catch (error) {
                        throw error;
                    }
                });
            });

        });
        
    });
});
