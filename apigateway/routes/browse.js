'use strict';

const request = require('request');
const router = require('express').Router();

const URL = `${process.env.STICKER_SERVICE_URL}/stickers`;

router.get('/', function stickerRouteBrowse(req, res) {
    const renderData = { pageTitle: 'Browse', entry: 'browse' };

    console.log('Render values: ', renderData);

    res.render('index', renderData);
});

router.get('/api/items', function stickerRouteApiBrowse(req, res) {
    const options = { url: URL, qs: { tags: req.query.tags }, json: true };
    request.get(options, (error, response) => {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.send({ items: response.body });
        }
    });
});

module.exports = router;
