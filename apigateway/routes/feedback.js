'use strict';

const express = require('express');
const request = require('request');
const guid = require('guid');

//This route calls into the ASP.NET Core checkout microservice
const checkoutServiceUrl = require('../config/services-config').checkoutServiceUrl; //TODO: add env url lookup

const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));

//Ensures that the user is authenticated prior to calling into this route
var authService = require('../services/auth');
router.use(authService.isUserLoggedIn);

router.post('/', function stickerRouteFeedback(req, res) {
  
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
