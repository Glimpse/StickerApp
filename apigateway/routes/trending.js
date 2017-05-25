'use strict';

const express = require('express');
const router = new express.Router();

const appInsights = require("applicationinsights");
const iKey = require('../config/appinsights-config').aiSettings.iKey;
const aiClient = appInsights.getClient(iKey);

router.get('/', function trendingStickerRouteBrowse(req, res) {
    aiClient.trackRequest(req, res);

    const renderData = { pageTitle: 'Trending Stickers', entry: 'trending' };
    console.log('Render values: ', renderData);
    res.render('index', renderData);
});

module.exports = router;
