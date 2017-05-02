module.exports = {
    "server": {
        "port": process.env.PORT || 3000,
        "https": false
    },

    //"dataSource": "dummy",
    "dataSource": "mongodb",

     "mongodb": {
        "port": 27017,
        "dbName": "getStickersDemo",
        "stickerCollectionName": "stickers",
        "cartCollectionName": "carts",
        "orderCollectionName": "orders",
        "feedbackCollectionName": "feedbackEntries"
    }
};
