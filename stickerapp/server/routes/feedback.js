'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const router = new express.Router();

const dataAccess = require('../db/data-access');

router.use(bodyParser.urlencoded({ extended: true }));

router.post('/', function stickerRouteFeedback(req, res) {
    dataAccess.addFeedback(req.body, () => {
        console.log('Feedback added');
        res.render('index', { pageTitle: 'Feedback', entry: 'feedback' });
    });
});

module.exports = router;
