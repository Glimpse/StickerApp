'use strict';

const bodyParser = require('body-parser');
const db = require('../mongodb');
const router = require('express').Router();

// Gets sticker details from the database, with
// optional query parameters "tags" and "ids".
router.get('/', async (req, res) => {
    let tags;
    if (req.query.tags) {
        tags = req.query.tags.split(',');
    }

    try {
        const stickers = await db.getStickersAsync(tags, req.query.ids);
        res.send(stickers);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.use(bodyParser.json());

// Add a new sticker to the database.
// If the sticker already exists, responds 400.
router.post('/:item_id', async (req, res) => {
    try {
        const sticker = await db.getStickerAsync(req.params.item_id);
        if (sticker) {
            res.sendStatus(400);
        } else {
            const newItems = await db.addStickersAsync([req.body]);
            res.send(newItems[0]);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;
