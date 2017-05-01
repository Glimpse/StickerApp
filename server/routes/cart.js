'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const dataAccess = require('../db/data-access');

const router = express.Router();

router.use(bodyParser.json());

router.get('/', function stickerRouteCart(req, res) {
    res.render('index', { pageTitle: 'Cart', entry: 'cart' });
});

function sendItems(token, res) {
    dataAccess.getCart(token, (items) => {
        dataAccess.getStickers(null, (stickers) => {
            res.send({
                items: items.map((id) => stickers.filter((sticker) => sticker.id.toString() === id)[0])
            });
        });
    });
}

router.get('/api/items', (req, res) => {
    if (!req.query.token) {
        res.status(401).send('Unauthorized');
        return;
    }
    sendItems(req.query.token, res);
});

router.put('/api/items/:item_id', (req, res) => {
    if (!req.body.token) {
        res.status(401).send('Unauthorized');
        return;
    }

    console.log('Item targetted %s', req.params.item_id);

    dataAccess.addToCart(req.body.token, req.params.item_id, () => {
        dataAccess.getSticker(req.params.item_id, (item) => {
            if (!item) {
                dataAccess.addStickers([ req.body.item ], () => sendItems(req.body.token, res));
            } else {
                sendItems(req.body.token, res);
            }
        });
    });
});

router.delete('/api/items/:item_id', (req, res) => {
    if (!req.body.token) {
        res.status(401).send('Unauthorized');
        return;
    }

    console.log('Item targetted', req.params.item_id);

    dataAccess.removeFromCart(req.body.token, req.params.item_id, () => {
        sendItems(req.body.token, res);
    });
});

module.exports = router;
