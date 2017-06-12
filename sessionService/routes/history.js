'use strict';

const dataAccess = require('../data');
const kafka = require('no-kafka');
const router = require('express').Router();

// this producer publishes a stream of browsing events
// the sticker service uses to calculate sticker popularity
const kafkaProducer = new kafka.Producer({ connectionString: process.env.KAFKA_HOST });
kafkaProducer.init().then(() => console.log('kafka producer ready'));

// get recently viewed items
router.get('/', async (req, res) => {
    try {
        const items = await dataAccess.getHistoryAsync(req.userId);
        res.send(items);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// record a new history entry
router.put('/:item_id', async (req, res) => {
    console.log(`user ${req.userId} viewed ${req.params.item_id}`);

    // send a Kafka message to inform the sticker service of the view event
    try {
        await kafkaProducer.send({
            topic: process.env.KAFKA_TOPIC,
            partition: 0,
            message: { value: JSON.stringify([{ id: req.params.item_id }]) }
        });
    } catch (error) {
        console.error('error sending kafka message', error);
    }

    try {
        const history = await dataAccess.addItemToHistoryAsync(req.userId, req.params.item_id);
        res.send(history);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

module.exports = router;
