'use strict';

const crypto = require('crypto');
const express = require('express');
const request = require('request');
const router = express.Router();

const nobodyAuthorRegex = /nobody@flickr.com \((.*)\)/;

// Note: we handle image search on the server side to demonstrate the application of microservices
router.get('/', (req, res) => {
    const keyword = req.query.keyword;

    if (!keyword) {
        console.warn('No keyword was specified; searching with \'undefined\'');
    }

    console.log('Handling /api/search. Keyword: ' + keyword);

    const url = 'http://api.flickr.com/services/feeds/photos_public.gne?tags='
        + keyword + '&format=json&jsoncallback=?';

    request({ url, json: true }, (err, response, body) => {
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
