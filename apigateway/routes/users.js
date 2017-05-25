'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const authService = require('../services/auth');
const config = require('../config/aad-b2c-config');

const appInsights = require("applicationinsights");
const iKey = require('../config/appinsights-config').aiSettings.iKey;
const aiClient = appInsights.getClient(iKey);

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

//Uses passport.authenticate() as route middleware to authenticate the
//request. After the user is authenticated, the authentication provider
//redirects the user back to this application at /auth/return.
router.get('/auth',
  function authenticate(req, res, next) {

      aiClient.trackRequest(req, res);

      passport.authenticate('azuread-openidconnect',
          {
              response: res,
              failureRedirect: '/browse'
          }
    )(req, res, next);
  });

//Called by POST /auth/return.
var authenticate = function authenticate(req, res, next) {
    aiClient.trackRequest(req, res);

    //Check to see if the user has chosen to reset their password
    var error = req.body['error_description'];
    if (error && error.indexOf('AADB2C90118') != -1) {
        //Redirect to the password reset policy so that the user can reset their password
        res.redirect('/users/auth?p=B2C_1_PasswordReset');
    } else {
        passport.authenticate('azuread-openidconnect',
            {
                response: res,
                failureRedirect: '/browse'
            })(req, res, next);
    }
};

//Uses passport.authenticate() as route middleware to authenticate the
//request.  One of the following will happen:
//If authentication fails, they will be redirected to the specified failure route.
//If the user has selected to reset their password, they will be prompted to reset it and then to log in again
//Otherwise, the user will be redirected to browse page after becoming logged in.
router.post('/auth/return', authenticate, function authRedirect(req, res) { res.redirect('/browse'); });

router.get('/auth/logout', function logout(req, res){

    aiClient.trackRequest(req, res);

    var userId = req.user.id;
    req.session.destroy(function deleteUser() {
        authService.deleteUserProfile(userId)
        .then(function logOut() {
            req.logOut();
            res.redirect(config.destroySessionUrl);
            console.log('Log out succeeded');
        });
    });
});

//Used to get the user's profile data; this is called by the client views whenever the user logs in and out so
//the the client has up-to-date user data.
router.get('/auth/user_profile', function getUserProfileData(req, res) {

    aiClient.trackRequest(req, res);

    var userFriendlyId = '';
    var fullName = '';
    var email = '';
   
    if (req.user && req.user.profile){
        //Get a user friendly identifier to display by the client when the user logs in.  First we attempt to show the first name, otherwise we use the display name.
        userFriendlyId = req.user.profile.firstName ? req.user.profile.firstName : req.user.profile.displayName;
        
        var firstName = req.user.profile.firstName ? req.user.profile.firstName : '';
        var lastName = req.user.profile.lastName ? req.user.profile.lastName : '';
        fullName = firstName + ' ' + lastName;
        email = req.user.profile.email;
    }

    res.send({
        profile:{
            isAuthenticated: req.isAuthenticated(),
            userFriendlyId: userFriendlyId,
            fullName: fullName,
            email: email
        }
    });
});

module.exports = router;