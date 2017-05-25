'use strict';

const redisClient = require('redis').createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    tls: process.env.REDIS_TLS,
    retryStrategy: options => {
        // retry every 2 seconds for 10 seconds; crash, if that doesn't suffice
        if (options.total_retry_time < 10 * 1000) {
            console.log(`${options.error}, retrying...`);
            return 2000;
        }

        throw 'unable to connect to redis';
    }
});
redisClient.on('error', err => {
    // swallow errors to allow retries as specified in the retry_strategy above
    console.log(`redis client error: ${err}`);
});

module.exports = redisClient;
