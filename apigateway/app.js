var express = require('express');
var session = require('express-session');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
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
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/users', users);
app.use('/profile', profile);

// setup the auth's datastore where authenticated user\profile data is stored
authService.setupAuthDataStore();

const server = app.listen(serverConnection.port, () => {
    console.log(`Sticker server running on port ${server.address().port}`);
});

module.exports = app;