'use strict';

const itemPopularity = require('../itemPopularity');
const router = require('express').Router();

// responds with the k most popular stickers, ordered by descending popularity
router.get('/:k', async (req, res) => {
    const k = parseInt(req.params.k);
    if (!Number.isInteger(k) || k < 0) {
        res.sendStatus(400);
        return;
    }

    try {
        const stickers = await itemPopularity.topKAsync(k);
        res.send(stickers);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;
