'use strict';

const express = require('express');

const cart = require('./routes/cart');
const history = require('./routes/history');

const app = express();

// add the client's user id, provided by apigateway,
// to the request so subsequent routes can use it
app.use((req, res, next) => {
    const userId = req.header('stickerUserId');
    if (!userId) {
        res.sendStatus(400);
    } else {
        req.userId = userId;
        next();
    }
});

app.use('/cart', cart);
app.use('/history', history);

const listener = app.listen(process.env.PORT, () => {
    console.log(`Session service listening on ${listener.address().port}`);
});
