'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const itemPopularity = require('./itemPopularity');

const search = require('./routes/search');
const stickers = require('./routes/stickers');
const top = require('./routes/top');

if (app.get('env') === 'development') {
    const db = require('./mongodb');
    const path = require('path');
    const test = require('./routes/test');

    // give the db some time to get ready, then initialize it with some data
    // TODO use the gulp task for this (in an init container perhaps)
    setTimeout(() => db.initializeDatabaseAsync()
        .then(console.log('db initialized with seed data')), 20000);

    app.use(express.static(path.join(__dirname, 'test')));
    app.use('/test', test);
}

app.use('/search', search);
app.use('/stickers', stickers);
app.use('/top', top);

// websocket stuff: send the current top items to all new connections,
// and update everyone when the top items change
io.on('connection', function sendTrendingItems(socket) {
    console.log(`new socket ${socket.id} connected from ${socket.client.conn.remoteAddress}`);
    itemPopularity.topKAsync(5)
        .then(top5 => socket.send(top5))
        .catch(error => console.log(`sending top items failed: ${error}`));
});
itemPopularity.on('newTopItems', topItems => io.send(topItems));

server.listen(process.env.PORT || 8080, () => {
    console.log(`Sticker service listening on ${server.address().port}`);
});
