'use strict';

const express = require('express');
const request = require('request');
const guid = require('guid');

//This route calls into the ASP.NET Core checkout microservice
const checkoutServiceUrl = process.env.CHECKOUT_SERVICE_URL;

const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', function stickerRouteCheckout(req, res) {
    var orderJson = {
        Id: guid.raw(),
        FullName: req.body['checkout-name'],
        Email: req.body['checkout-email'],
        Items: req.body['checkout-items']
    };

    // TODO this uses the sticker service's test route to produce a kafka
    // message for this order. The checkout service should do that itself.
    request.post({
        url: `${process.env.STICKER_SERVICE_URL}/test/checkout`,
        body: { 'checkout-items': orderJson.Items },
        json: true
    }, (error, response) => { });

    request({
        url: checkoutServiceUrl + '/api/order/',
        method: 'POST',
        json: true,
        body: orderJson,
        headers: {
            //Pass the current authenticated user's id to the checkout microservice
            'stickerUserId': req.user.id
        }
    }, function finishAddOrder(error) {
        if (error) {
            console.log('Adding Order failed: ' + error);
            res.sendStatus(500);
        } else {
            console.log('Order added');
            request.delete({
                url: `${process.env.SESSION_SERVICE_URL}/cart`,
                headers: { 'stickerUserId': req.user.id }
            }, (error, response) => {
                if (error) {
                    console.error(error);
                }
                res.render('index', { pageTitle: 'Checkout', entry: 'checkout' })
            });
        }
    });
});

module.exports = router;
