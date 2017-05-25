'use strict';

const request = require('request');

const url = process.env.STICKER_SERVICE_URL;

exports.addStickersAsync = items => {
    return new Promise((resolve, reject) => {
        const options = {
            url: `${url}/stickers/${items[0].id}`,
            body: items[0],
            json: true
        };
        request.post(options, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.body);
            }
        });
    });
};

exports.getStickersAsync = (tags, itemIds) => {
    return new Promise((resolve, reject) => {
        const options = {
            url: `${url}/stickers`,
            json: true,
            qs: {
                ids: itemIds || undefined,
                tags: tags || undefined
            }
        };
        request.get(options, (error, response) => {
            if (error) {
                reject(error);
            } else {
                resolve(response.body);
            }
        });
    });
};

exports.getStickerAsync = async id => {
    return (await this.getStickersAsync(null, id))[0];
};
