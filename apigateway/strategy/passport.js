var passport = require('passport');
var authService = require('../services/auth');

module.exports = function getSetUser() {

    //used to serialize the user for the session
    passport.serializeUser(function serialize(user, done) {
        console.log('User serialized');
        done(null, user.id);
    });

    // used to deserialize the user from the session
    passport.deserializeUser(function deserialize(userId, done) {
        authService.findUserProfile(userId)
        .then(function finishDeserialize(user){
            console.log('User deserialized');
            done(null, user);
        });
    });
};