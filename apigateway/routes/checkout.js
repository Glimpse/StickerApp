'use strict';

const express = require('express');
const request = require('request');
const guid = require('guid');

//This route calls into the ASP.NET Core checkout microservice
const checkoutServiceUrl = process.env.CHECKOUT_SERVICE_URL;

const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', (req, res) => {
    var order = {
        Id: guid.raw(),
        UserId: req.user.id,
        FullName: req.body['checkout-name'],
        Email: req.body['checkout-email'],
        Items: req.body['checkout-items']
    };

    request.post({
        url: checkoutServiceUrl + '/api/order/',
        json: true,
        body: order
    }, (error, response) => {
        if (error) {
            console.error(`Could not reach checkout service: ${error}`);
            res.sendStatus(500);
        } else if (response.statusCode > 201) {
            // TODO ASP.NET Core describes model validation errors in its
            // response, which we could surface in the client
            console.log(`Order rejected by checkout service: ${JSON.stringify(response.body)}`);
            res.sendStatus(400);
        } else {
            console.log('Order added');

            // checkout succeeded, empty the cart
            request.delete({
                url: `${process.env.SESSION_SERVICE_URL}/cart`,
                headers: { stickerUserId: req.user.id }
            }, (error, response) => {
                if (error) {
                    console.error(`Could not reach session service: ${error}`);
                }
                res.render('index', { pageTitle: 'Checkout', entry: 'checkout' });
            });
        }
    });
});

module.exports = router;
