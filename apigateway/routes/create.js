'use strict';

const proxy = require('http-proxy-middleware');
const router = require('express').Router();

const appInsights = require("applicationinsights");
const iKey = require('../config/appinsights-config').aiSettings.iKey;
const aiClient = appInsights.getClient(iKey);

router.get('/', function stickerRouteCreate(req, res) {

    aiClient.trackRequest(req, res);
     
    const renderData = { pageTitle: 'Create', entry: 'create' };
    console.log('Render values: ', renderData);
    res.render('index', renderData);
});

router.get('/api/search', proxy({
    target: process.env.STICKER_SERVICE_URL,
    pathRewrite: { '^/create/api': '' }
}));

module.exports = router;
