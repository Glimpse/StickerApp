var express = require('express');
var router = express.Router();
var passport = require('passport');
var authService = require('../services/auth.service');
var config = require('../config/aad-b2c-config');

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

// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
router.get('/auth/openid/return',
  function authenticate(req, res, next) {
      passport.authenticate('azuread-openidconnect',
          {
              response: res,
              failureRedirect: '/fail'
          }
    )(req, res, next);
  },

  function showProfile(req, res) {
      console.log('Received return from AzureAD.');
      res.redirect('/profile');
  });

// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// body (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
router.post('/auth/openid/return',
  function authenticate(req, res, next) {
      passport.authenticate('azuread-openidconnect',
          {
              response: res,
              failureRedirect: '/fail'
          }
    )(req, res, next);
  },

  function showProfile(req, res) {
      console.log('Received return from Azure AD.');
      res.redirect('/profile');
  });

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