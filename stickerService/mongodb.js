'use strict';

const { MongoClient } = require('mongodb');

const stickerCollectionName = 'stickers';

function getConnectionString() {
    const url = require('url');
    let parsed = url.parse(process.env.MONGO_URL);
    if (parsed.pathname === '/') {
        // no database name specified => insert a default
        let connectionString = url.resolve(parsed, 'stickerDb');

        // resolve will remove a query string => if there was one, append it
        return parsed.query ? `${connectionString}?${parsed.query}` : connectionString;
    }

    return process.env.MONGO_URL;
}
const connectionString = getConnectionString();

let connection;
function connect() {
    if (!connection) {
        console.log(`connecting to mongodb at ${connectionString}`);
        return MongoClient.connect(connectionString).then(db => {
            connection = db;
            return connection;
        });
    }

    return Promise.resolve(connection);
}

function disconnect() {
    if (connection) {
        return connection.close().then(() => {
            connection = null;
        });
    }

    return Promise.resolve();
}

function findDoc(db, collectionName, criteria) {
    return db.collection(collectionName).findOne(criteria);
}

function findDocs(db, collectionName, criteria) {
    return db.collection(collectionName).find(criteria).toArray();
}

function insertDocs(db, collectionName, docs) {
    return db.collection(collectionName).insert(docs);
}

exports.getStickerAsync = id => {
    return connect().then(db => {
        return findDoc(db, stickerCollectionName, { id });
    });
};

exports.getStickersAsync = (tags, itemIds) => {
    return connect().then(db => {
        const query = {};
        if (tags) {
            query.tags = {
                $elemMatch: { $in: tags }
            };
        }

        if (itemIds instanceof Array) {
            query.id = { $in: itemIds };
        } else if (typeof itemIds === 'string') {
            query.id = { $in: [itemIds] };
        }

        return findDocs(db, stickerCollectionName, query);
    });
};

exports.addStickersAsync = items => {
    return connect().then(async db => {
        const result = await insertDocs(db, stickerCollectionName, items);
        return result.ops;
    });
};

exports.initializeDatabaseAsync = data => {
    return connect()
        .then(db => db.dropDatabase())
        .then(() => exports.addStickersAsync(data))
        .then(disconnect);
};
