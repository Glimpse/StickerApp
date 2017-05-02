
//TODO: Need to get the connection URL from env variable to support when deployed
//e.g. process.env.DB_URL or something equivalent

//TODO: Add info in instructions that the MySQL db needs to be created by the user first
exports.dbSettings = {
    URI: process.env.DB_URL || "mysql://root:Admin_007@localhost/StickerDemoApp"
};

exports.serverConnection = {
    port: 3000
}


