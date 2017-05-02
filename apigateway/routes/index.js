var express = require('express');
var router = express.Router();

//TODO: This route is temporary for now to allow us to test auth until the client side auth work is completed;
//this will be removed from the final sample
router.get(
    '/',
    function showLogin(req, res) {

        res.send('<br><font size="5" color="blue"><b>AAD-B2C Login</b><br></font>' +
            '<a href="/users/auth?p=B2C_1_SignInAndSignUp">Log In w/ AAD or Facebook</a>');
    }
);

//TODO: This route is temporary for now to allow us to test auth until the client side auth work is completed;
//this will be removed from the final sample
router.get('/fail', function showFailure(req, res) {

    res.send('Authentication failed');
});

module.exports = router;
