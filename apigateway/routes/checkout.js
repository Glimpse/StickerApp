'use strict';

const express = require('express');
const request = require('request');
const guid = require('guid');

const appInsights = require("applicationinsights");
const iKey = require('../config/appinsights-config').aiSettings.iKey;
const aiClient = appInsights.getClient(iKey);

//This route calls into the ASP.NET Core checkout microservice
const checkoutServiceUrl = process.env.CHECKOUT_SERVICE_URL;

const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', function stickerRouteCheckout(req, res) {

    aiClient.trackRequest(req, res);

    var orderJson = {
        Id: guid.raw(),
        FullName: req.body['checkout-name'],
        Email: req.body['checkout-email'],
        Items: req.body['checkout-items']
    };

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
            }, (error) => {
                if (error) {
                    console.error(error);
                }
                res.render('index', { pageTitle: 'Checkout', entry: 'checkout' });
            });
        }
    });
});

module.exports = router;
