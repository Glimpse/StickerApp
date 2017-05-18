'use strict';

var express = require('express');
var session = require('express-session');
var path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const authService = require('./services/auth');

const users = require('./routes/users');
const browse = require('./routes/browse');
const cart = require('./routes/cart');
const feedback = require('./routes/feedback');
const create = require('./routes/create');
const checkout = require('./routes/checkout');

const app = express();

app.set('etag', false);
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'client', 'dist')));

require('./strategy/aad-b2c')();
require('./strategy/passport')();

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'MySecret'
}));

app.use(logger('dev'));
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

// setup the auth's datastore where authenticated user\profile data is stored
authService.setupAuthDataStore();

//All routes that do NOT require auth should be added here (prior to authService.verifyUserLoggedIn being added as a route)
app.use('/users', users);
app.use('/browse', browse);
app.use('/cart', cart); //TODO: Will require auth
app.use('/create', create); //TODO: Will require auth

app.get('/', function stickerRootRedirection(req, res) {
    console.log('app.js: redirecting to browse');
    res.redirect('/browse');
});

//Ensures that the user is authenticated prior to calling into routes
//All routes requiring auth should be added after authService.verifyUserLoggedIn
app.use(authService.verifyUserLoggedIn);
app.use('/checkout', checkout);
app.use('/feedback', feedback);

const server = app.listen(process.env.PORT, () => {
    console.log(`apigateway listening on port ${server.address().port}`);
});

module.exports = app;
