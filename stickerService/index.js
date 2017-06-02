'use strict';

const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const itemPopularity = require('./itemPopularity');

const search = require('./routes/search');
const stickers = require('./routes/stickers');
const top = require('./routes/top');

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
