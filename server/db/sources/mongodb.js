'use strict';

const { MongoClient } = require('mongodb');
const mongoConfig = require('../../config').mongodb;
const initialData = require('../initial-data');

let connection;
function connect() {
    if (!connection) {
        return MongoClient.connect(mongoConfig.url).then((db) => {
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

// This supports adding either a single doc or an array of docs
function dbInsertDocs(db, collectionName, doc) {
    const collection = db.collection(collectionName);
    return collection.insert(doc);
}

function dbReadDocs(db, collectionName, criteria) {
    const collection = db.collection(collectionName);
    return collection.find(criteria).toArray();
}

function dbReadOneDoc(db, collectionName, criteria) {
    const collection = db.collection(collectionName);
    return collection.findOne(criteria);
}

function dbUpdateDocs(db, collectionName, criteria, doc) {
    const collection = db.collection(collectionName);
    const options = { w: 1, multi: true, upsert: false };
    return collection.update(criteria, doc, options);
}

function dbRemoveOneDoc(db, collectionName, criteria) {
    const collection = db.collection(collectionName);
    const options = { w: 1, single: true };
    return collection.remove(criteria, options);
}

// Public APIs
function getStickers(tags) {
    console.log('mongodb.js: getStickers');
    return connect().then((db) => {
        const query = {};
        if (tags) {
            query.tags = {
                $elemMatch: { $in: tags }
            };
        };
        
        return dbReadDocs(db, mongoConfig.stickerCollectionName, query);
    });
}

function getSticker(id) {
    console.log('mongodb.js: getSticker');
    return connect().then((db) => {
        return dbReadOneDoc(db, mongoConfig.stickerCollectionName, { id });
    });
}

function addStickers(items) {
    console.log('mongodb.js: addStickers');
    return connect().then((db) => {
        return dbInsertDocs(db, mongoConfig.stickerCollectionName, items);
    });
}

function getCart(token) {
    console.log('mongodb.js: getCart');
    return connect().then((db) => {
        return dbReadOneDoc(db, mongoConfig.cartCollectionName, { _id: token });
    });
}

function addToCart(token, itemId) {
    console.log('mongodb.js: addToCart');
    return connect().then((db) => {
        return dbReadOneDoc(db, mongoConfig.cartCollectionName, { _id: token }).then((cart) => {
            if (!cart) {
                return dbInsertDocs(db, mongoConfig.cartCollectionName, {
                    _id: token,
                    items: [ itemId ]
                });
            } else {
                return dbUpdateDocs(db, mongoConfig.cartCollectionName, { _id: token }, {
                    $addToSet: { items: itemId }
                });
            }
        });
    });
}

function removeFromCart(token, itemId) {
    console.log('mongodb.js: removeFromCart');
    return connect().then((db) => {
        return dbReadOneDoc(db, mongoConfig.cartCollectionName, { _id: token }).then((cart) => {
            if (!cart) {
                return;
            }

            return dbUpdateDocs(db, mongoConfig.cartCollectionName, { _id: token }, {
                $pull: { items: itemId }
            });
        });
    });
}

function clearCart(token) {
    console.log('mongodb.js: clearCart');
    return connect().then((db) => {
        return dbRemoveOneDoc(db, mongoConfig.cartCollectionName, {
            _id: token
        });
    });
}

function addOrder(doc) {
    console.log('mongodb.js: addOrder');
    return connect().then((db) => {
        return dbInsertDocs(db, mongoConfig.orderCollectionName, doc);
    });
}

function addFeedback(doc) {
    console.log('mongodb.js: addFeedback');
    return connect().then((db) => {
        return dbInsertDocs(db, mongoConfig.feedbackCollectionName, doc);
    });
}

function initializeDatabase() {
    return connect()
        .then((db) => db.dropDatabase())
        .then(() => addStickers(initialData))
        .then(disconnect);
}

module.exports = {
    getStickers,
    getSticker,
    addStickers,
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    addOrder,
    addFeedback,
    initializeDatabase
};