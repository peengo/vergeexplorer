# VergeExplorer

A responsive design Verge (XVG) Cryptocurrency Blockchain Explorer built on top of KoaJS JSON API (NodeJS) backend and VueJS (vue-cli) frontend

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes

### Prerequisites

```
* Ubuntu 18.04.3 LTS (Bionic Beaver) Server
* NodeJS v10.16.3
* NPM v6.9.0
* MongoDB v4.0.12 with Replica Set enabled and configured (required for ACID transactions)
* Verge Daemon v6.0.2 (Fully Synced) -> verge-6.0.2-x86_64-linux-gnu.tar.gz [https://github.com/vergecurrency/VERGE/releases]
```

What is not covered here
```
* Installation of NodeJS, MongoDB,...
* Creation of a MongoDB Database and user
* Configuration of a MongoDB Replica Set
```

### Installing

A step by step series of examples that tell you how to get a development environment running

Clone the repository

```
git clone https://github.com/peengo/vergeexplorer.git
```

Install npm packages and dependencies

```
cd vergeexplorer/server && npm install
cd ..
cd client && npm install
```

Download & extract from `verge-6.0.2-x86_64-linux-gnu.tar.gz` [https://github.com/vergecurrency/VERGE/releases]

Create a `.VERGE` folder inside your home directory

Copy `VERGE.conf` file to this directory

Fill out `rpcuser=` and `rpcpassword=` fields in this file. You decide what this two will be. You will use this values later in `.env` file

Start the Verge Daemon (RPC)
```
./verge-6.0.2/bin/verged -daemon
```

This will take time to sync the blockchain. Alternatively and advisiably you can download the blockchain to speed up the blockchain syncing process

Inside `server` folder create an empty `.env` file with the contents from `example.env` and fill it out with proper values.

Inside `client` folder create `.env.development.local` file with `VUE_APP_API_DEV_URL=http://192.168.0.104:5000` <- your IP and port to the backend (server) API here

Create a MongoDB database with the name `blockchain`

Create collections and build indexes with the commands below

```
use blockchain

db.createCollection("blocks")
db.createCollection("txs")
db.createCollection("addresses")
db.createCollection("ios")

db.blocks.createIndex({ height: 1 }, { unique: true, background: true })
db.blocks.createIndex({ hash: 1 }, { unique: true, background: true })

db.txs.createIndex({ txid: 1 }, { unique: true, background: true })
db.txs.createIndex({ "vin.txid": 1 }, { background: true })
db.txs.createIndex({ time: 1 }, { background: true })
db.txs.createIndex({ "vout.scriptPubKey.addresses": 1 }, { background: true })
db.txs.createIndex({ "vout.scriptPubKey.type": 1 }, { background: true })
db.txs.createIndex({ blockhash: 1 }, { background: true })

db.addresses.createIndex({ address: 1 }, { unique: true, background: true })
db.addresses.createIndex({ balance: 1 }, { background: true, collation: { locale: "en_US", numericOrdering: true }})

db.ios.createIndex({ txid: 1 }, { background: true })
db.ios.createIndex({ address: 1 }, { background: true })
db.ios.createIndex({ type: 1 }, { background: true })
db.ios.createIndex({ time: 1 }, { background: true })
db.ios.createIndex({ time: -1, type: -1 }, { background: true })
```

### Running

**Start syncing blockchain to the database**

Do this when the Verge Daemon is running (fully synced) and accepting commands

inside `server` folder
```
npm run sync
```

**Start server (Backend) API**

inside `server` folder
```
npm run dev
```

**Start client (Frontend)**

inside `client` folder
```
npm run serve
```
