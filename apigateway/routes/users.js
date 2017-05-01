var express = require('express');
var router = express.Router();
var passport = require('passport');
var authService = require('../services/auth.service');
var config = require('../config/aad-b2c-config');
var bodyParser = require('body-parser');

//Uses passport.authenticate() as route middleware to authenticate the
//request. After the user is authenticated, the authentication provider
//redirects the user back to this application at /auth/openid/return.
router.get('/auth/openid',
  function authenticate(req, res, next) {
      passport.authenticate('azuread-openidconnect',
          {
              response: res,
              failureRedirect: '/fail'
          }
    )(req, res, next);
  },

  function redirect(req, res) {
      res.redirect('/profile');
  });

//Called by POST /auth/openid/return.
authenticate = function(req, res, next) {
    
    //Check to see if the user has chosen to reset their password
    var error = req.body['error_description'];
    if (error && error.indexOf('AADB2C90118') != -1) {
        //Redirect to the password reset policy so that the user can reset their password
        res.redirect('/users/auth/openid/?p=B2C_1_PasswordReset');
    }

    else{
        passport.authenticate('azuread-openidconnect',
        {
            response: res,
            failureRedirect: '/fail'
        })(req, res, next);
    }
 };

//Called by POST /auth/openid/return.
 showProfile = function(req, res, next) {
        console.log('Received return from Azure AD.');
      res.redirect('/profile');
 };

//Uses passport.authenticate() as route middleware to authenticate the
//request.  One of the following will happen:
//If authentication fails, they will be redirected to the specified failure route.
//If the user has selected to reset their password, they will be prompted to reset it and then to log in again
//Otherwise, the user will be redirected to the primary route.
router.post('/auth/openid/return', authenticate, showProfile);

router.get('/auth/openid/logout', function logout(req, res){
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

module.exports = router;