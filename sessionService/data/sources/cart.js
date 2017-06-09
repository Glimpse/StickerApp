'use strict';

// Cart APIs implemented with a Redis backend. Because quantities are POSTed at
// checkout, we need only track which stickers are in the cart; therefore, the
// cart is persisted as a set of item ids keyed on the client uuid.

const redisClient = require('./redisClient');
const cartKey = userId => `${userId}:cart`;

exports.getCartAsync = userId => {
    return new Promise((resolve, reject) => {
        redisClient.smembers([cartKey(userId)], (error, items) => {
            if (error) {
                reject(error);
            } else {
                resolve(items);
            }
        });
    });
};

exports.addToCartAsync = (userId, itemId) => {
    return new Promise((resolve, reject) => {
        redisClient.sadd([cartKey(userId), itemId], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

exports.mergeCartsAsync = (destUserId, userIds) => {
    return new Promise((resolve, reject) => {
        var args = [cartKey(destUserId)].concat(userIds.map(userId => cartKey(userId)));
        redisClient.sunionstore(args, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

exports.removeFromCartAsync = (userId, itemId) => {
    return new Promise((resolve, reject) => {
        redisClient.srem([cartKey(userId), itemId], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

exports.clearCartAsync = userId => {
    return new Promise((resolve, reject) => {
        redisClient.del([cartKey(userId)], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};
