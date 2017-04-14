'use strict';

// This module tracks item popularity. It watches a Kafka topic for checkout
// and item view events. It uses these events to calculate a popularity score,
// persisted in Redis, for each item. A higher score indicates greater popularity.
// Scores are weighted toward orders: one order is worth three views. Also,
// recent activity has more weight than past activity: scores decay over time.

const events = require('events');
const kafka = require('kafka-node');
const redis = require('redis');
const db = require('./mongodb');

const eventEmitter = new events.EventEmitter();
exports.on = (event, listener) => eventEmitter.on(event, listener);

const REDIS_KEY = 'items:popularityscores';
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS,
    retry_strategy: options => {
        // retry every 2 seconds for 10 seconds; crash, if that doesn't suffice
        if (options.total_retry_time < 10 * 1000) {
            console.log(`${options.error}, retrying...`);
            return 2000;
        }

        throw `can't connect to redis`;
    }
});
redisClient.on('error', err => {
    // swallow errors to allow retries as specified in the retry_strategy above
    console.log(`redis client error ${err}`);
});
redisClient.on('ready', () => {
    console.log('redis client ready');
    setInterval(decayScores, 60 * 1000);
});

exports.topKAsync = (k, withScores) => {
    // returns the top k highest-scoring items
    return new Promise((resolve, reject) => {
        let args = [REDIS_KEY, 0, k];
        if (withScores === true) {
            args.push('withscores');
        }

        redisClient.zrevrange(args, async (error, itemIds) => {
            if (error) {
                return reject(error);
            }
            // we want the stickers ordered by descending score, but the
            // database doesn't track scores, so we have to sort here
            const stickers = await db.getStickersAsync(null, itemIds);
            const sorted = stickers.sort((a, b) =>
                itemIds.indexOf(a.id) - itemIds.indexOf(b.id)
            );
            resolve(sorted);
        });
    });
};

function decayScores() {
    // retrieve all item ids with score >= 1
    redisClient.zrangebyscore([REDIS_KEY, 1, '+inf', 'withscores'], (err, result) => {
        if (err || result.length === 0) {
            return;
        }

        let messages = ['decaying popularity scores'];
        let newScores = [];
        // zrangebyscore withscores returns [itemId, score, ...]
        for (let i = 0; i < result.length; i += 2) {
            const itemId = result[i];
            const oldScore = result[i + 1];
            const newScore = oldScore * 0.8;
            // zadd expects [score, itemId, ...], the reverse of zrangebyscore's ordering
            newScores.push(newScore, itemId);
            messages.push(`  ${itemId}: ${oldScore} -> ${newScore}`);
        }

        redisClient.zadd([REDIS_KEY, ...newScores], (err, result) => {
            if (err) {
                messages.push(`  score update failed: ${err}`);
            } else {
                messages.push('  done');
            }
            console.log(messages.join('\n'));
        });
    });
};

function increaseItemScoreAsync(itemId, increaseAmount) {
    return new Promise((resolve, reject) => {
        redisClient.zincrby([REDIS_KEY, increaseAmount, itemId], (error, newScore) => {
            if (error) {
                reject(error);
            } else {
                resolve(`${itemId} score: ${newScore - increaseAmount} -> ${newScore}`);
            }
        });
    });
};

// we expect msg.value is JSON for this:
// [ { "item_id": string, "quantity": number? }, ... ]
// where "quantity" is undefined for view events
const messageMalformed = offset => `message at offset ${offset} is malformed`;
function validateMessage(message) {
    return new Promise((resolve, reject) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message.value);
        } catch (ex) {
            return reject(messageMalformed(message.offset));
        }

        let events = [];
        for (const element of parsedMessage) {
            if (!element.item_id) {
                return reject(messageMalformed(message.offset));
            }

            let event = { item_id: element.item_id };
            if (element.quantity) {
                const quantity = parseInt(element.quantity);
                if (!Number.isInteger(quantity)) {
                    return reject(messageMalformed(message.offset));
                }
                event.quantity = quantity;
            }

            events.push(event);
        }
        resolve(events);
    });
}

function topItemsChanged(a, b) {
    if (a.length !== b.length) {
        return true;
    }

    for (let i = 0; i < a.length; ++i) {
        if (a[i].id !== b[i].id) {
            return true;
        }
    }

    return false;
}

async function handleMessage(msg) {
    const items = await validateMessage(msg);
    const priorTopItems = await exports.topKAsync(5);

    // increase item scores
    const scoreMessages = await Promise.all(items.map(item => {
        // arbitrary multiplier: 1 order is worth 3 views
        // (item.quantity is undefined for view events)
        const scoreIncrement = item.quantity ? item.quantity * 3 : 1;
        return increaseItemScoreAsync(item.item_id, scoreIncrement);
    }));
    console.log(scoreMessages.join('\n'));

    const newTopItems = await exports.topKAsync(5);
    if (topItemsChanged(newTopItems, priorTopItems)) {
        eventEmitter.emit('newTopItems', newTopItems);
    }
}

// this consumer reacts to item views and checkouts
const KAFKA_TOPIC = process.env.KAFKA_TOPIC;
const kafkaConsumer = new kafka.Consumer(
    new kafka.Client(process.env.KAFKA_HOST),
    [{ topic: KAFKA_TOPIC }]
);
kafkaConsumer.on('error', error => {
    console.log(`kafkaConsumer error: ${error}`);
    if (error.name === 'TopicsNotExistError') {
        // when using docker-compose we may try to connect before the
        // kafka container creates the topic--try again in 10 seconds
        kafkaConsumer.removeTopics([KAFKA_TOPIC], (error, numberRemoved) => {
            console.log('... retrying in 10 seconds');
            setTimeout(() => {
                kafkaConsumer.addTopics([KAFKA_TOPIC], (error, added) => {
                    if (error) { throw error; }
                    console.log(`... added topic ${added}`);
                })
            }, 10000);
        });
    }
});
kafkaConsumer.on('message', async msg => {
    try {
        await handleMessage(msg);
    } catch (error) {
        console.error('error handling Kafka message', error);
    }
});
