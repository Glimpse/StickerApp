'use strict';

// History APIs implemented with a Redis backend. History entries should be
// ordered chronologically and unique--a stack with no duplicates--so we use a
// sorted set with an item's score being the Unix time of its most recent view.

const redisClient = require('./redisClient');

const MAX_HISTORY_ENTRIES = 10;
const historyKey = userId => `${userId}:views`;

function pruneHistoryAsync(userId) {
    return new Promise((resolve, reject) => {
        // check whether history has reached maximum size
        redisClient.zcard([historyKey(userId)], async (error, size) => {
            if (error) {
                reject(error);
                return;
            }

            if (size < MAX_HISTORY_ENTRIES) {
                return resolve(exports.getHistoryAsync(userId));
            }

            // remove the oldest elements
            const args = [historyKey(userId), 0, size - MAX_HISTORY_ENTRIES];
            redisClient.zremrangebyrank(args, async (error, numberRemoved) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(exports.getHistoryAsync(userId));
                }
            });
        });
    });
}

exports.addItemToHistoryAsync = (userId, itemId) => {
    return new Promise((resolve, reject) => {
        const key = historyKey(userId);
        redisClient.zadd([key, Date.now(), itemId], (error, membersAdded) => {
            if (error) {
                reject(error);
                return;
            }

            if (membersAdded === 0) {
                // this item was already in history -> we've only updated
                // its score; the set cannot now exceed the max length
                return resolve(this.getHistoryAsync(userId));
            }

            // waiting on the prune operation here limits re-entrance because
            // in normal circumstances the client is waiting on a response
            // which won't be sent until addItemToHistory resolves
            pruneHistoryAsync(userId)
                .then(items => resolve(items))
                .catch(error => reject(error));
        });
    });
}

exports.getHistoryAsync = userId => {
    return new Promise((resolve, reject) => {
        const args = [historyKey(userId), 0, MAX_HISTORY_ENTRIES];
        redisClient.zrevrange(args, (error, items) => {
            if (error) {
                reject(error);
            } else {
                resolve(items);
            }
        });
    });
}
