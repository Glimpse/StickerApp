'use strict';

const dataAccess = require('../data');
const kafka = require('kafka-node');
const router = require('express').Router();

// this producer publishes a stream of browsing events
// the sticker service uses to calculate sticker popularity
const kafkaProducer = new kafka.Producer(new kafka.Client(process.env.KAFKA_HOST));

// get recently viewed items
router.get('/', async (req, res) => {
    try {
        const items = await dataAccess.getHistoryAsync(req.userId);
        res.send(items);
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

// record a new history entry
router.put('/:item_id', async (req, res) => {
    // send a Kafka message to inform the sticker service of the view event
    const payload = [{
        topic: process.env.KAFKA_TOPIC,
        messages: JSON.stringify([{ id: req.params.item_id }])
    }];
    kafkaProducer.send(payload, (err, result) => {
        if (err) {
            // only log errors because failure doesn't affect this service's
            // core purpose (also the reason not to wait for the callback)
            console.log(`Kafka send failed: ${err.message}`);
        }
    });

    try {
        const history = await dataAccess.addItemToHistoryAsync(req.userId, req.params.item_id);
        res.send(history);
    } catch (error) {
        res.sendStatus(500);
    }
});

module.exports = router;
