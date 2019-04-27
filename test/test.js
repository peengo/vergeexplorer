require('dotenv').config();

const chai = require('chai')
const { assert, expect, should } = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const url = 'http://localhost';
const port = process.env.PORT;

const app = chai.request(`${url}:${port}`);

const contentType = 'application/json; charset=utf-8';

describe('API Tests', () => {
    describe('GET', () => {
        describe('/', () => {
            it('should return 404', done => {
                app
                    .get('/block')
                    .end((err, res) => {
                        expect(res).to.have.status(404);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('status');
                        done();
                    });
            });
        });

        describe('/info', () => {
            it('should return info', done => {
                app
                    .get('/info')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.have.property('blocks_db').to.be.a('number');
                        expect(res.body.data).to.have.property('blocks_rpc').to.be.a('number');
                        expect(res.body.data).to.have.property('moneysupply').to.be.a('number');
                        expect(res.body.data).to.have.property('paytxfee').to.be.a('number');
                        done();
                    });
            });
        });

        describe('/peers', () => {
            it('should return peers', done => {
                app
                    .get('/peers')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                        expect(res.body.data[0]).to.have.property('addr').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('conntime').to.be.a('number');
                        expect(res.body.data[0]).to.have.property('version').to.be.a('number');
                        expect(res.body.data[0]).to.have.property('subver').to.be.a('string');
                        done();
                    });
            });
        });

        describe('/richlist', () => {
            it('should return a richlist', done => {
                app
                    .get('/richlist')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                        expect(res.body.data[0]).to.have.property('address').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('sent').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('received').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('balance').to.be.a('string');
                        done();
                    });
            });
        });

        describe('/latest/blocks', () => {
            it('should return latest blocks', done => {
                app
                    .get('/latest/blocks')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.be.an('array').to.have.lengthOf.above(1);
                        expect(res.body.data[0]).to.have.property('hash').to.be.a('string');
                        expect(res.body.data[0]).to.have.property('height').to.be.a('number');
                        expect(res.body.data[0]).to.have.property('time').to.be.a('number');
                        expect(res.body.data[0].tx).to.be.an('array');
                        done();
                    });
            });
        });

        describe('/latest/txs', () => {
            it('should return latest txs', done => {
                app
                    .get('/latest/txs')
                    .end((err, res) => {
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
                        done();
                    });
            });
        });

        describe('/block/00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278', () => {
            it('should return genesis block', done => {
                app
                    .get('/block/00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('data');
                        expect(res.body.data).to.include({
                            hash: '00000fc63692467faeb20cdb3b53200dc601d75bdfa1001463304cc790d77278',
                            height: 0
                        });
                        done();
                    });
            });
        });

        describe('/block/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00', () => {
            it('should return "block not found"', done => {
                app
                    .get('/block/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                        done();
                    });
            });
        });

        describe('/block/', () => {
            it('should return 404', done => {
                app
                    .get('/block')
                    .end((err, res) => {
                        expect(res).to.have.status(404);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('status');
                        done();
                    });
            });
        });

        describe('/block/1', () => {
            it('should return an error (not found)', done => {
                app
                    .get('/block/1')
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                        done();
                    });
            });
        });

        describe('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00', () => {
            it('should return genesis tx', done => {
                app
                    .get('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd00')
                    .end((err, res) => {
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
                        done();
                    });
            });
        });

        describe('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd01', () => {
            it('should return transaction not found', done => {
                app
                    .get('/tx/1c83275d9151711eec3aec37d829837cc3c2730b2bdfd00ec5e8e5dce675fd01')
                    .end((err, res) => {
                        expect(res).to.have.status(200);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                        done();
                    });
            });
        });

        describe('/tx/1', () => {
            it('should return not a valid txid', done => {
                app
                    .get('/tx/1')
                    .end((err, res) => {
                        expect(res).to.have.status(400);
                        expect(res).to.have.header('content-type', contentType);
                        expect(res).to.be.json;
                        expect(res.body).to.have.property('error');
                        done();
                    });
            });
        });


    });
});

