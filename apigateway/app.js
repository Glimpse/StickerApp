var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var proxy = require('express-http-proxy');

var forwardAuthHeader = require('./middleware/authForwarding')();
var authService = require('./services/auth');
var serverConnection = require('./config/database-config').serverConnection;

var index = require('./routes/index');
var users = require('./routes/users');
var profile = require('./routes/profile');
var app = express();

require('./strategy/aad-b2c')();
require('./strategy/passport')();

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'MySecret'
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use('/gatewayTest', index);
app.use('/users', users);
app.use('/profile', profile);

// At this point, no routes specific to this service will handle the request,
// so store user identity (if any) in a header before proceeding.
app.use(forwardAuthHeader);

// Inter-service routing
app.use('/',  proxy(process.env.StickerAppClientUrl || serviceEndpoints.stickerAppClientUrl))

// setup the auth's datastore where authenticated user\profile data is stored
authService.setupAuthDataStore();

const server = app.listen(serverConnection.port, () => {
    console.log(`Sticker server running on port ${server.address().port}`);
});

module.exports = app;