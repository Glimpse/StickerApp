'use strict';

const cart = require('./sources/cart');
const history = require('./sources/history');
const stickers = require('./sources/stickers');

module.exports = {
    addToCartAsync: cart.addToCartAsync,
    clearCartAsync: cart.clearCartAsync,
    getCartAsync: cart.getCartAsync,
    removeFromCartAsync: cart.removeFromCartAsync,
    addItemToHistoryAsync: history.addItemToHistoryAsync,
    getHistoryAsync: history.getHistoryAsync,
    addStickersAsync: stickers.addStickersAsync,
    getStickerAsync: stickers.getStickerAsync,
    getStickersAsync: stickers.getStickersAsync
};
