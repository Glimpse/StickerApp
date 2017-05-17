'use strict';

const dataSource = require('./dummy');

module.exports = {
    getStickers: dataSource.getStickers,
    getSticker: dataSource.getSticker,
    addStickers: dataSource.addStickers,
    addOrder: dataSource.addOrder,
    addFeedback: dataSource.addFeedback,
    getCart: dataSource.getCart,
    addToCart: dataSource.addToCart,
    removeFromCart: dataSource.removeFromCart,
    clearCart: dataSource.clearCart
};
