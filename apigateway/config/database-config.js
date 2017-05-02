
//TODO: Need to get the connection URL from env variable to support when deployed
//e.g. process.env.DB_URL or something equivalent

exports.dbSettings = {
    URI: process.env.DB_URL || 'mysql://root@localhost/StickerDemoApp',
    retryCount: 5,
    retryIntervalMS: 5000
};

exports.serverConnection = {
    port: 3000
};


