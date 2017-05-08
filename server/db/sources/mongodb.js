'use strict';


const mongoClient = require('mongodb').MongoClient;
const mongoConfig = require('../../config').mongodb;
const initialData = require('../initial-data');
const mongodbUri = require('mongodb-uri');

// parse the mongodb url to add the database if necessary
var url = process.env.MONGODB_URL || `mongodb://${mongoConfig.host}:${mongoConfig.port}`;
let urlObject = mongodbUri.parse(url);
urlObject.database = mongoConfig.dbName;
url = mongodbUri.format(urlObject);

// This supports adding either a single doc or an array of docs
function dbInsertDocs(db, collectionName, doc, cb) {
    const collection = db.collection(collectionName);
    collection.insert(
        doc,
        (err, result) => {
            if (err) { throw err; }
            cb(result);
        }
    );
}

function dbReadDocs(db, collectionName, criteria, cb) {
    const collection = db.collection(collectionName);
    collection.find(criteria).toArray(
        (err, result) => {
            if (err) { throw err; }
            cb(result);
        }
    );
}

function dbReadOneDoc(db, collectionName, criteria, cb) {
    const collection = db.collection(collectionName);
    collection.findOne(
        criteria,
        (err, result) => {
            if (err) { throw err; }
            cb(result);
        }
    );
}

function dbUpdateDocs(db, collectionName, criteria, doc, cb) {
    const collection = db.collection(collectionName);
    const options = { w: 1, multi: true, upsert: false };
    collection.update(
        criteria,
        doc,
        options,
        (err, updateCount) => {
            if (err) { throw err; }
            cb(updateCount);
        }
    );
}

function dbRemoveOneDoc(db, collectionName, criteria, cb) {
    const collection = db.collection(collectionName);
    const options = { w: 1, single: true };
    collection.remove(
        criteria,
        options,
        (err, deleteCount) => {
            if (err) { throw err; }
            cb(deleteCount);
        }
    );
}

function dbDropCollection(db, collectionName) {
    const collection = db.collection(collectionName);
    collection.drop();
}

// Public APIs
function getStickers(tags, cb) {
    console.log('mongodb.js: getStickers');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        const query = {};
        if (tags) {
            query.tags = {
                $elemMatch: { $in: tags }
            };
        }
        dbReadDocs(db, mongoConfig.stickerCollectionName, query, (result) => {
            db.close();
            cb(result);
        });
    });
}

function getSticker(id, cb) {
    console.log('mongodb.js: getSticker');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbReadOneDoc(db, mongoConfig.stickerCollectionName, { id }, (result) => {
            db.close();
            cb(result);
        });
    });
}

function addStickers(items, cb) {
    console.log('mongodb.js: addStickers');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbInsertDocs(db, mongoConfig.stickerCollectionName, items, (result) => {
            db.close();
            cb(result);
        });
    });
}

function getCart(token, cb) {
    console.log('mongodb.js: getCart');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbReadOneDoc(db, mongoConfig.cartCollectionName, {
            _id: token
        }, (result) => {
            db.close();
            cb(result && result.items || []);
        });
    });
}

function addToCart(token, itemId, cb) {
    console.log('mongodb.js: addToCart');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbReadOneDoc(db, mongoConfig.cartCollectionName, { _id: token }, (cart) => {
            if (!cart) {
                dbInsertDocs(db, mongoConfig.cartCollectionName, {
                    _id: token,
                    items: [ itemId ]
                }, () => {
                    db.close();
                    cb();
                });
            } else {
                dbUpdateDocs(db, mongoConfig.cartCollectionName, {
                    _id: token
                }, {
                    $addToSet: { items: itemId }
                }, () => {
                    db.close();
                    cb();
                });
            }
        });
    });
}

function removeFromCart(token, itemId, cb) {
    console.log('mongodb.js: removeFromCart');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbReadOneDoc(db, mongoConfig.cartCollectionName, { _id: token }, (cart) => {
            if (!cart) {
                db.close();
                cb();
                return;
            }
            dbUpdateDocs(db, mongoConfig.cartCollectionName, {
                _id: token
            }, {
                $pull: { items: itemId }
            }, () => {
                db.close();
                cb();
            });
        });
    });
}

function clearCart(token, cb) {
    console.log('mongodb.js: clearCart');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbRemoveOneDoc(db, mongoConfig.cartCollectionName, {
            _id: token
        }, () => {
            db.close();
            cb();
        });
    });
}

function addOrder(doc, cb) {
    console.log('mongodb.js: addOrder');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbInsertDocs(db, mongoConfig.orderCollectionName, doc, (result) => {
            db.close();
            cb(result);
        });
    });
}

function addFeedback(doc, cb) {
    console.log('mongodb.js: addFeedback');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbInsertDocs(db, mongoConfig.feedbackCollectionName, doc, (result) => {
            db.close();
            cb(result);
        });
    });
}

function initializeDatabase(cb) {
    console.log('mongodb.js: initializeDatabase');
    mongoClient.connect(url, (err, db) => {
        if (err) { throw err; }
        dbDropCollection(db, mongoConfig.stickerCollectionName);
        dbDropCollection(db, mongoConfig.orderCollectionName);
        dbDropCollection(db, mongoConfig.feedbackCollectionName);
        dbDropCollection(db, mongoConfig.cartCollectionName);
        addStickers(initialData, () => {
            db.close();
            cb();
        });
    });
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
