var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var config = require('../config/aad-b2c-config');
var authService = require('../services/auth');

module.exports = function getOIDStrategy() {

    //TODO: Decide which optional settings we want to include (if any)
    passport.use(new OIDCStrategy({
        identityMetadata: config.creds.identityMetadata,
        clientID: config.creds.clientID,
        responseType: config.creds.responseType,
        responseMode: config.creds.responseMode,
        redirectUrl: config.creds.redirectUrl,
        allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
        clientSecret: config.creds.clientSecret,
        validateIssuer: config.creds.validateIssuer,
        isB2C: config.creds.isB2C,
        issuer: config.creds.issuer,
        passReqToCallback: config.creds.passReqToCallback,
        useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
        cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    },
    function verify(iss, sub, profile, accessToken, refreshToken, done) {
        if (!profile.oid) {
            return done(new Error('No oid found'), null);
        }

        // asynchronous verification, for effect...
        process.nextTick(function asyncCall() {

            //Note: Code assumes that AAD is configured so that the signup\signin policies include the following attributes and claims:
            //Display Name, Email Address, Given Name, Surname, User's Object Id
            var displayName = profile.displayName ? profile.displayName : '';
            var firstName = profile.name ? profile.name.givenName : '';
            var lastName = profile.name ? profile.name.familyName : '';
            var email = profile.emails && profile.emails.length ? profile.emails[0] : '';

            authService.findOrCreateUserProfile(profile.oid, 'aad-b2c', displayName, firstName, lastName, email)
            .then(function finishFindOrCreate(userProfile){
                done(null, userProfile);
            })
            .catch(function catchError(err) {
                done(err);
            });
        });
    }));
};



