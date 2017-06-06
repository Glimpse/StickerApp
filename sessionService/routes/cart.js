'use strict';

const bodyParser = require('body-parser');
const dataAccess = require('../data');
const router = require('express').Router();

// send the db record corresponding to each item id in the cart
async function sendItems(userId, res) {
    const cartItemIds = await dataAccess.getCartAsync(userId);
    if (cartItemIds.length < 1) {
        res.send({ items: [] });
        return;
    }

    const stickers = await dataAccess.getStickersAsync(null, cartItemIds);
    res.send({
        items: cartItemIds.map(id =>
            stickers.filter(sticker => sticker.id === id)[0]
        )
    });
}

router.get('/', async (req, res) => {
    try {
        await sendItems(req.userId, res);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.delete('/', async (req, res) => {
    try {
        await dataAccess.clearCartAsync(req.userId);
        res.sendStatus(204);
        console.log(`${req.userId}: emptied cart`);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.delete('/:item_id', async (req, res) => {
    try {
        await dataAccess.removeFromCartAsync(req.userId, req.params.item_id);
        await sendItems(req.userId, res);
        console.log(`${req.userId}: removed ${req.params.item_id}`);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

router.use(bodyParser.json());

router.put('/:item_id', async (req, res) => {
    try {
        // this may be a new item; ensure it's in the database
        const sticker = await dataAccess.getStickerAsync(req.params.item_id);
        if (!sticker) {
            if (!req.body.item) {
                // not in database, no new record provided
                res.sendStatus(400);
                return;
            }
            await dataAccess.addStickersAsync([req.body.item]);
        }

        await dataAccess.addToCartAsync(req.userId, req.params.item_id);
        await sendItems(req.userId, res);
        console.log(`${req.userId}: added ${req.params.item_id} to cart`);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Transfers one user's cart items to another user's cart
// (useful for when a user begins a session with a temporary
// un-auth'd user ID and then later logs in)
router.put('/transfer/:oldUserId', async (req, res) => {
    try {
        // If the old user has cart items, transfer them to 
        // the current user's cart.
        if ((await dataAccess.getCartAsync(req.params.oldUserId)).length > 0) {
            // Merge the two carts
            await dataAccess.mergeCartsAsync(req.userId, [req.userId, req.params.oldUserId]);
            
            // Once the carts are merged, it doesn't make sense to leave the partial
            // cart for the original anonymous user.
            await dataAccess.clearCartAsync(req.params.oldUserId);
        }

        // Return the user's current cart items (after merging, if necessary)
        await sendItems(req.userId, res);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;
