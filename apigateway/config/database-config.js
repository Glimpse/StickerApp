
//TODO: Need to get the connection URL from env variable to support when deployed
//e.g. process.env.DB_URL or something equivalent

exports.dbConnection = {
    port: 3306,
    host: 'localhost',
    database: 'StickerAuthDB',
    username: 'root',
    password: '',
    retryCount: 5,
    retryIntervalMS: 5000
};

