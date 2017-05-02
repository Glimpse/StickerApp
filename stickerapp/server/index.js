'use strict';

const path = require('path');
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();

const browse = require('./routes/browse.js');
const create = require('./routes/create.js');
const cart = require('./routes/cart.js');
const checkout = require('./routes/checkout.js');
const feedback = require('./routes/feedback.js');

const config = require('./config.js');

const PROJECT_ROOT = path.join(__dirname, '..');

app.set('etag', false);

app.set('views', path.join(PROJECT_ROOT, 'templates'));
app.set('view engine', 'pug');

app.use(express.static(path.join(PROJECT_ROOT, 'client', 'dist')));

app.use(function glimpseMiddleware(req, res, next) {
    res.setHeader('X-Powered-By', 'Glimpse');

    next();
});

// Edge caches XHR calls, which means that once it fetches an empty cart, it caches the empty cart response. Seriously, WTF?
app.use(function stickerCacheSetup(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.use('/browse', browse);
app.use('/create', create);
app.use('/cart', cart);
app.use('/checkout', checkout);
app.use('/feedback', feedback);

app.get('/', function stickerRootRedirection(req, res) {
    console.log('index.js: redirecting to browse');
    res.redirect('/browse');
});

if (config.server.https) {
    const server = https.createServer({
        key: fs.readFileSync(config.server.key),
        cert: fs.readFileSync(config.server.cert),
        passphrase: config.server.keyPassphrase
    }, app).listen(config.server.port, () => {
        console.log(`Sticker server running on port ${server.address().port} using HTTPS`);
    });
} else {
    const server = app.listen(config.server.port, () => {
        console.log(`Sticker server running on port ${server.address().port}`);
    });
}
