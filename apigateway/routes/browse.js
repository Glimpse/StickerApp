'use strict';

//TODO: This functionality is temporary until integated with the new cart microservice; note that this currently calls into the "dummy" data access layer
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const dataAccess = require('../temp/db/data-access');

router.use(bodyParser.json());

router.get('/', function stickerRouteBrowse(req, res) {
    const renderData = { pageTitle: 'Browse', entry: 'browse' };

    console.log('Render values: ', renderData);

    res.render('index', renderData);
});

router.get('/api/items', function stickerRouteApiBrowse(req, res) {
    // Do things with req.query.tags
    let tags;
    if (req.query.tags) {
        tags = req.query.tags.split(',');
    }

    dataAccess.getStickers(tags, (items) => {
        console.info('%d stickers found', items.length);
        if (tags) {
            console.log('Tags used in filter: ', tags);
        }

        res.send({
            items
        });
    });
});

module.exports = router;
