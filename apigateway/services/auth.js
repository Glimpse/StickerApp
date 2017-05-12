var Sequelize = require('sequelize');
var dbSettings = require('../config/database-config').dbSettings;
var userModel = require('../models/user');
var profileModel = require('../models/profile');

var sql = new Sequelize(dbSettings.URI);

var tables = {
    profileTable: profileModel(sql).profile,
    userTable: userModel(sql).user
};

exports.setupAuthDataStore = function setup() {
    var retryCount = dbSettings.retryCount;
    var retryIntervalMS = dbSettings.retryIntervalMS;

    var tryAuthenticate = function tryAuthenticate() {
        sql.authenticate()
            .then(function finishSchema() {
                //The User and Profile tables share a compositional relationship and are used to store the authenticated
                //user's information.  Passport then stores\retrieves the authenticated user data to\from MySQL based on the user id
                //that is stored in the server session - this is so that the user only has to log in once.
                tables.userTable.associate(tables.profileTable);
                tables.profileTable.associate(tables.userTable);
                console.log('Database connection has been established successfully.');
                return sql.sync();
            })
            .catch(function catchError(err) {
                // There are some timing issues when spinning up docker-compose environments
                // since MySql takes some time to start and create the initial schema.
                // Allow a limited number of retries to work around that problem.
                if (retryCount-- > 0) {
                    console.log('Could not connect to database; trying again in ' + retryIntervalMS + ' MS');
                    console.log('Retries remaining: ' + retryCount);
                    setTimeout(tryAuthenticate, retryIntervalMS);
                } else {
                    console.log('User/Profile schema creation failed:' + err);
                }
            });
    }();
};

exports.findUserProfile = findUserProfile;
function findUserProfile(userId) {
    //Attempts to find the authenticated user in MySQL by their id; this is the id that is stored within the
    //server side session.
    return tables.userTable.findById(userId, { include: [{ model: tables.profileTable }] });
}

exports.deleteUserProfile = function performDelete(userId) {
    //Deletes the user profile from MySQL; this is needed when the user logs out.
    return findUserProfile(userId)
        .then(function finishDelete(user) {
            user.destroy();
            return user;
        })
        .catch(function catchError(err) {
            console.log('User deletion failed:' + err);
        });
};

exports.findOrCreateUserProfile = function performFindOrCreate(userId, authType, displayName, firstName, lastName, email) {
    //When a user is authenticated, checks to see if the user already exists in MySQL; if it doesn't,
    //this user and profile is created.
    return tables.userTable.findOrCreate({
        where: { id: userId },
        include: [{ model: tables.profileTable }],
        defaults: { id: userId, authType: authType }
    })
        .then(function findOrCreateProfile(user) {
            if (!user || user.length == 0) {
                throw new Error('User find or create failed');
            }
            if (user[0].profile) {
                return user[0];
            }

            return tables.profileTable.create({
                displayName: displayName,
                firstName: firstName,
                lastName: lastName,
                email: email
            })
                .then(function associate(profile) {
                    profile.setUser(user[0]);
                    return user[0];
                });
        })
        .catch(function catchError(err) {
            console.log('User/Profile find or create failed:' + err);
        });
};

exports.isUserLoggedIn = function isAuthenticated(req, res, next) {

    //Determines whether the user is authenticated; if they are, execution will continue to the next middleware
    //function.  Otherwise, the user will be redirected to login.
    if (req.isAuthenticated()) {
        console.log('Authentication succeeded');
        return next();
    }

    console.log('Authentication failed');
    res.redirect('/users/auth?p=B2C_1_SignInAndSignUp');
};