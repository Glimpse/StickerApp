'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const CART_URL = `${process.env.SESSION_SERVICE_URL}/cart`;
const router = express.Router();

router.get('/', function stickerRouteCart(req, res) {
    res.render('index', { pageTitle: 'Cart', entry: 'cart' });
});

router.get('/api/items', function getCart(req, res) {
    request.get(CART_URL, {
        headers: { stickerUserId: req.user.id },
        json: true
    }, (error, response) => {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.send(response.body);
        }
    });
});

router.delete('/api/items/:item_id', function removeItem(req, res) {
    console.log('Item targeted', req.params.item_id);
    request.delete(`${CART_URL}/${req.params.item_id}`, {
        headers: { stickerUserId: req.user.id },
        json: true
    }, (error, response) => {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.send(response.body);
        }
    });
});

router.use(bodyParser.json());
router.put('/api/items/:item_id', function addItem(req, res) {
    console.log('Item targeted %s', req.params.item_id);
    request.put(`${CART_URL}/${req.params.item_id}`, {
        headers: { stickerUserId: req.user.id },
        body: req.body,
        json: true
    }, (error, response) => {
        if (error) {
            console.error(error);
            res.sendStatus(500);
        } else {
            res.send(response.body);
        }
    });
});

module.exports = router;
