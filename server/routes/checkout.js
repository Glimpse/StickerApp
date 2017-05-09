'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const dataAccess = require('../db/data-access');

router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', function stickerRouteCheckout(req, res) {
    if (!req.body.token) {
        res.status(401).send('Unauthorized');
        return;
    }
    dataAccess.addOrder({
        items: req.body['checkout-items'],
        name: req.body['checkout-name'],
        email: req.body['checkout-email'],
        token: req.body.token
    }).then(() => {
        console.log('Order added');
        return dataAccess.clearCart(req.body.token);
    }).then(() => {
        res.render('index', { pageTitle: 'Checkout', entry: 'checkout' });
    });
});

module.exports = router;