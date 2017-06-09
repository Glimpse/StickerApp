'use strict';

const options = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || undefined,
    retry_strategy: options => {
        // retry every 2 seconds for 10 seconds; crash, if that doesn't suffice
        if (options.total_retry_time < 10 * 1000) {
            console.log(`${options.error}, retrying...`);
            return 2000;
        }

        throw 'unable to connect to redis';
    }
};

if (process.env.REDIS_TLS_SERVERNAME) {
    options.tls = { servername: process.env.REDIS_TLS_SERVERNAME }
}

const redisClient = require('redis').createClient(options);
redisClient.on('error', err => {
    // swallow errors to allow retries as specified in the retry_strategy above
    console.log(`redis client error: ${err}`);
});
redisClient.on('ready', () => console.log('redis client ready'));

module.exports = redisClient;
