'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const router = new express.Router();

const dataAccess = require('../db/data-access');
router.use(bodyParser.json());

router.get('/', function stickerRouteBrowse(req, res) {
    const renderData = { pageTitle: 'Browse', entry: 'browse' };
    console.log('Render values: ', renderData);
    res.render('index', renderData);
});

router.get('/api/items', function stickerRouteApiBrowse(req, res) {
    let tags;
    if (req.query.tags) {
        tags = req.query.tags.split(',');
    }

    dataAccess.getStickers(tags).then((items) => {
        console.info('%d stickers found', items.length);
        if (tags) {
            console.log('Tags used in filter: ', tags);
        }

        res.send({ items });
    }, () => {
        res.send({ items: [] });
    });
});

module.exports = router;