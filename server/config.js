module.exports = {
    'server': {
        'port': process.env.PORT || 3000,
        'https': false
    },
    'dataSource': 'mongodb',
    'mongodb': {
        'port': 27017,
        'host': 'localhost',
        'dbName': 'getStickersDemo',
        'stickerCollectionName': 'stickers',
        'orderCollectionName': 'orders',
        'feedbackCollectionName': 'feedback',
        'cartCollectionName': 'carts'
    }
};
