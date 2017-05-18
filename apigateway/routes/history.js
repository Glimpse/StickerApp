'use strict';

const request = require('request');
const router = require('express').Router();

const HISTORY_URL = `${process.env.SESSION_SERVICE_URL}/history`;

// TODO decide whether to surface history in the client,
// this route is only needed to support that
router.get('/api/items', function getHistory(req, res) {
    request.get(HISTORY_URL, {
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

router.put('/api/item/:item_id', function addItem(req, res) {
    if (!req.user) {
        req.user = { id: 'anonymous' };
    }
    console.log(`${req.user.id} viewed ${req.params.item_id}`);
    request.put(`${HISTORY_URL}/${req.params.item_id}`, {
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

module.exports = router;
