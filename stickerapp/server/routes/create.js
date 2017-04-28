'use strict';

const crypto = require('crypto');
const express = require('express');
const request = require('request');
const router = new express.Router();

const nobodyAuthorRegex = /nobody@flickr.com \((.*)\)/;

router.get('/', function stickerRouteCreate(req, res) {
    const renderData = { pageTitle: 'Create', entry: 'create' };

    console.log('Render values: ', renderData);

    res.render('index', renderData);
});

// these logs are added to test and demonstrate server side proxy for console logging
function testServerLogging() {
    /*
    // console.log
    console.log('[Node.js] 1. Server-side console logging tests...');
    console.log('[Node.js] 2. console.log test: ' + 'searching image');
    console.log('[Node.js] 3. console.log format test: %s has %d star!', 'glimpse', 5);
    console.log('[Node.js] 4. console.log format test: %s has %d star %d', 'glimpse', 5);

    // console.info
    console.info('[Node.js] 5. console.info test: %s', 'this is informational');

    // console.warn
    console.warn('[Node.js] %d. console.warn test: %s', 6, 'this is a warning!');

    // console.error
    console.error('[Node.js] 7. console.error test: this is an error!');

    //console.assert
    console.assert(true, '[Node.js] 8. console.assert test: assert succeeded');
    */
}

// Note: we handle image search on the server side to demonstrate the application of microservices
router.get('/api/search', (req, res) => {
    const keyword = req.query.keyword;

    testServerLogging();

    if (!keyword) {
        console.warn('No keyword was specified; searching with \'undefined\'');
    }

    console.log('Handling /api/search. Keyword: ' + keyword);

    const url = 'http://api.flickr.com/services/feeds/photos_public.gne?tags='
        + keyword + '&format=json&jsoncallback=?';

    request({
        url,
        json: true
    }, (err, response, body) => {
        if (!err && response.statusCode === 200) {
            console.log('Flickr search succeeded with items:');
            const items = cleanUpSearchResult(body);
            console.log(items);
            res.cookie('last-keyword', keyword, { expires: new Date(Date.now() + 900000) });
            res.cookie('last-search-result-length', items.length);
            res.send({
                items: items
            });
        } else {
            console.log('Flickr search failed');
            const statusCodeBadRequest = 400;
            res.status(statusCodeBadRequest).send({
                items: []
            });
        }
    });
});

// Clean up Flickr search result so that it can be parsed by JSON.parse() on client side
function cleanUpSearchResult(data) {
    // Remove the outer parenthesis
    let result = data.slice(1, -1);

    // Strip out single quotes in image descriptions which might confuse the JSON parser
    result = result.replace(/\\'/g, '');

    // Parse the results
    result = JSON.parse(result);
    return result.items.map((item) => {
        const nobodyCheck = nobodyAuthorRegex.exec(item.author);
        return {
            id: crypto.createHash('md5')
                .update(item.link)
                .digest('hex'), // Kinda hacky, but at least unique and guaranteed to be consistent across searches
            tags: item.tags.split(' '),
            name: item.title,
            description: item.description,
            author: nobodyCheck ? nobodyCheck[1] : item.author,
            size: {
                width: '2in',
                height: '2in'
            },
            image: item.media.m
        };
    });
}

module.exports = router;
