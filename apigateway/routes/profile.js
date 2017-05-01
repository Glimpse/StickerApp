var express = require('express');
var router = express.Router();
var authService = require('../services/auth.service');

//TODO: This route is temporary for now to allow us to test auth until the client side auth work is completed;
//this will be removed from the final sample
router.get('/', authService.isUserLoggedIn, function showProfile(req, res) {
    res.send('Welcome!<br>'
        + '<br>Display Name: ' + req.user.profile.displayName
        + '<br>First Name: ' + req.user.profile.lastName
        + '<br>Last Name: ' + req.user.profile.lastName
        + '<br><a href="/users/auth/openid/logout">AAD-B2C Logout</a><br>');
});

module.exports = router;