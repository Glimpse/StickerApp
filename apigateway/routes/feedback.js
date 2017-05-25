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

router.post('/', function stickerRouteFeedback(req, res) {
  
    aiClient.trackRequest(req, res);

    var feedbackJson = {
        'Id': guid.raw(),
        'Entry': req.body.feedback
    };

    request({
        url: checkoutServiceUrl + '/api/feedback',
        method: 'POST',
        json: true,
        body: feedbackJson,
        headers: {
            //Pass the current authenticated user's id to the checkout microservice
            'stickerUserId': req.user.id
        }},
        function finishAddFeedback(error){
            if (error) {
                console.log('Adding Feedback failed: ' + error);
            } else {
                console.log('Feedback added');
            }
            
            res.render('index', { pageTitle: 'Feedback', entry: 'feedback' });
        });
});

module.exports = router;
