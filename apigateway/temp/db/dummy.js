'use strict';

const initialData = require('./initial-data');
const carts  = {};

function filterItems(tags, items) {
    let filteredItems = items;
    if (tags.length) {
        filteredItems = items.filter((item) => {
            let match = false;
            for (const tag of tags) {
                if (item.tags.indexOf(tag) !== -1) {
                    match = true;
                }
            }
            return match;
        });
    }
    return filteredItems;
}

function getStickers(tags, cb) {
    let items = initialData;
    if (tags) {
        items = filterItems(tags, items);
    }
    setImmediate(() => cb(items));
}

function getSticker(id, cb) {
    setImmediate(() => {
        cb(initialData.filter((item) => item.id === id)[0]);
    });
}

function addStickers(items, cb) {
    for (const item of items) {
        for (let i = 0; i < initialData.length; i++) {
            if (initialData[i].id === item.id) {
                initialData.splice(i, 1);
                break;
            }
        }
        initialData.push(item);
    }
    setImmediate(cb);
}

function getCart(token, cb) {
    if (!carts[token]) {
        carts[token] = [];
    }
    setImmediate(() => cb(carts[token]));
}

function addToCart(token, itemId, cb) {
    if (!carts[token]) {
        carts[token] = [];
    }
    for (const existingId of carts[token]) {
        if (itemId === existingId) {
            setImmediate(cb);
            return;
        }
    }
    carts[token].push(itemId);
    setImmediate(cb);
}

function removeFromCart(token, itemId, cb) {
    if (!carts[token]) {
        carts[token] = [];
    }
    for (let i = 0; i < carts[token].length; i++) {
        if (itemId === carts[token][i]) {
            carts[token].splice(i, 1);
            break;
        }
    }
    setImmediate(cb);
}

function clearCart(token, cb) {
    carts[token] = [];
    setImmediate(cb);
}

function addOrder(order, cb) {
    setImmediate(cb);
}

function addFeedback(feedback, cb) {
    setImmediate(cb);
}

function initializeDatabase(cb) {
    setImmediate(cb);
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
