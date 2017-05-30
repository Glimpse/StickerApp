'use strict';

const express = require('express');
const router = new express.Router();

router.get('/', function trendingStickerRouteBrowse(req, res) {

    const renderData = { pageTitle: 'Trending Stickers', entry: 'trending' };
    console.log('Render values: ', renderData);
    res.render('index', renderData);
});

module.exports = router;
