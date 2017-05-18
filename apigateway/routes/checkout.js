
'use strict';

//TODO: This is temporary using the "dummy" data access layer in order to interact with the cart; this will be removed when integrated with new cart microservice
const dataAccess = require('../temp/db/data-access');

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
        FullName : req.body['checkout-name'],
        Email : req.body['checkout-email'],
        Items : req.body['checkout-items']
    };

    request({
        url: checkoutServiceUrl + '/api/order/',
        method: 'POST',
        json: true,
        body: orderJson,
        headers: {
            //Pass the current authenticated user's id to the checkout microservice
            'stickerUserId': req.user.id
        }},
        function finishAddOrder(error){
            if (error) {
                console.log('Adding Order failed: ' + error);
            } else {
                console.log('Order added');
            }
            
            //TODO: Need to update this when the new cart microservice is integrated; for now, calls into the "dummy" data access layer
            dataAccess.clearCart(req.body.token, () => {
                res.render('index', { pageTitle: 'Checkout', entry: 'checkout' });
            });
        });
});

module.exports = router;
