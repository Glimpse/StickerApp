var express = require('express');
var router = express.Router();

//TODO: This route is temporary for now to allow us to test auth until the client side auth work is completed;
//this will be removed from the final sample
router.get(
    '/',
    function showLogin(req, res) {
        //TODO: Follow up on the facebook issue and the best way to handle the sign-in\sign-up flow mentioned in the below note
        var note1 = '<p>If you are signing in with <b>facebook for the first time</b>, you will need to do the following:<br>' +
                    '(1) Click Sign Up - this will allow you to authenticate with facebook and then create a user in AAD<br>' +
                    'that is linked to your facebook account.<br>' +
                    '(2) After Sign Up, you should be redirected to the profile page which will show successful authentication.<br>' +
                    '(3) On the profile page, if you see null values instead of your first or last name, there seems to be an auth bug here that needs more investigation.<br>' +
                    'To fix this, click Log Out and then click Sign In which should automatically reauthenticate you with facebook and redirect <br>' +
                    'you to the profile page again - this time you should see your full name properly.<br><br>' +
                    '<b>Note:</b> In step #1, if you are logging in for the first time and you click Sign In instead of Sign Up, authentication will <br>' +
                    'fail (even though you successfully may have authenticated with facebook) saying <b>User Does Not Exist.</b> <br>' +
                    'This is because the user has not been added to AAD and linked to your facebook account.  To fix this, simply choose to <br>' +
                    'Sign Up - after this, authentication should succeed.';
        var note2 = '<p>If instead you want to authenticate using an <b>AAD email account</b>, you will first need to sign up to get one.<br>' +
                    'Once you are signed up, you can then choose to sign in.';
        res.send('<br><font size="5" color="blue"><b>AAD-B2C Login</b><br></font>Click one of the following to sign in using either an AAD email account or Facebook:<br>' +
                '<font size="4"><a href="/users/auth/openid/?p=B2C_1_SignIn">Sign In</a><br>' +
                '<a href="/users/auth/openid/?p=B2C_1_SignUp">Sign Up</a><br></font>' +
                note1 + note2);
    }
);

//TODO: This route is temporary for now to allow us to test auth until the client side auth work is completed;
//this will be removed from the final sample
router.get('/fail', function showFailure(req, res) {
    res.send('Authentication failed');
});

module.exports = router;
