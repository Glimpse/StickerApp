'use strict';

// Routes for sending Kafka messages representing checkout and view
// events, for simulating client activity in development.

const bodyParser = require('body-parser');
const kafka = require('kafka-node');
const router = require('express').Router();

const producer = new kafka.HighLevelProducer(new kafka.Client(process.env.KAFKA_HOST));

router.use(bodyParser.json());

// emit a kafka message for a checkout event
router.post('/checkout', (req, res) => {
    // expect body to be shaped like a checkout object posted by the client
    // e.g. { "checkout-items": { "sticker1": { "id": "sticker1", "quantity": 2 }, ..., }
    const checkoutItems = req.body['checkout-items'];

    const orderedStickers = Object.keys(checkoutItems).map(item => {
        return {
            id: checkoutItems[item].id,
            quantity: checkoutItems[item].quantity
        };
    });

    const payloads = [{
        topic: process.env.KAFKA_TOPIC,
        messages: JSON.stringify(orderedStickers)
    }];
    producer.send(payloads, (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(data);
        }
    });
});

// emit a Kafka message for a view event
router.get('/view/:item_id', (req, res) => {
    const message = JSON.stringify([{ id: req.params.item_id }]);
    const payload = [{
        topic: process.env.KAFKA_TOPIC,
        messages: message
    }];
    producer.send(payload, (err, data) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(data);
        }
    });
});

module.exports = router;
