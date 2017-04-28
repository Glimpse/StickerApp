var Sequelize = require('sequelize');
var dbConnection = require('../config/database-config').dbConnection;
var userModel = require('../models/user');
var profileModel = require('../models/profile');

var getTables = (function getTables(){
    var tables = null;

    //The User and Profile tables share a compositional relationship and are used to store the authenticated
    //user's information.  Passport then stores\retrieves the authenticated user data to\from MySQL based on the user id
    //that is stored in the server session - this is so that the user only has to log in once.
    return function initTables() {
        if (!tables){
            tables = {
                profileTable: profileModel(getSequelize()).Profile,
                userTable: userModel(getSequelize()).User
            };
        }
        return tables;
    };
})();

var getSequelize = (function getSequelize() {
    var dbSequelize = null;

    //Connects Sequelize for use with our MySQL db.
    return function initSequelize() {
        if (!dbSequelize) {
            dbSequelize = new Sequelize(
                dbConnection.database, dbConnection.username, dbConnection.password, {
                    port: dbConnection.port,
                    dialect: 'mysql',
                    host: process.env.dbConnection__Host || dbConnection.host
                });
        }
        return dbSequelize;
    };
})();

function connectToAuthDb() {
    return new Promise(function connect(resolve, reject) {
        var retryCount = dbConnection.retryCount;
        var retryIntervalMS = dbConnection.retryIntervalMS;

        var tryAuthenticate = function tryAuthenticate() {
            //Note: The database must already be created, otherwise you will see an error.
            getSequelize().authenticate()

                .then(function finishConnect() {
                    console.log('Connection has been established successfully.');
                    resolve(getSequelize());
                })

                .catch(function catchError(err) {
                    // There are some timing issues when spinning up docker-compose environments
                    // since MySql takes some time to start and create the initial schema.
                    // Allow a limited number of retries to work around that problem.
                    if (retryCount-- > 0) {
                        console.log('Could not connect to database; trying again in ' + retryIntervalMS + ' MS');
                        console.log('Retries remaining: ' + retryCount);
                        setTimeout(tryAuthenticate, retryIntervalMS)
                    } else {
                        console.log('Unable to connect to the database:', err);
                        reject(err);
                    }
                });
        }();
    });
}

function createUserProfileSchema(){

    return new Promise(function defineTables(resolve, reject){

        //Creates the User\Profile tables and their shared relationship.
        var tables = getTables();
        tables.userTable.associate(tables.profileTable);
        tables.profileTable.associate(tables.userTable);

        getSequelize().sync()

        .then(function finishDefineTables() {
            console.log('Schema creation succeeded');
            resolve();
        })

        .catch(function catchError(err) {
            console.log('Schema creation failed:' + err);
            reject(err);
        });
    });
}

exports.setupAuthDataStore = function setup() {

    connectToAuthDb()
    
    .then(function finishSetup() {
        createUserProfileSchema();
    });
};

exports.findUserProfile = findUserProfile;
function findUserProfile(userId){

    //Attempts to find the authenticated user in MySQL by their id; this is the id that is stored within the
    //server side session.
    return new Promise(function find(resolve, reject){

        getTables().userTable.findById(
            userId,
            {include: [{model: getTables().profileTable}]})
            
         .then(function finishFind(user){
             if (user) {
                 console.log('User profile found');
                 resolve(user);
             } else {
                 console.log('User profile not found');
                 reject(user);
             }
         })

         .catch(function catchError(err){
             console.log('User profile not found:' + err);
             reject(err);
         });
    });
}

exports.deleteUserProfile = function performDelete(userId){

    //Deletes the user profile from MySQL; this is needed when the user logs out.
    return new Promise(function findAndDelete(resolve, reject){

        findUserProfile(userId)

        .then(function startDelete(user){
            user.destroy()
            .then(function finishDelete(){
                console.log('User deletion successful');
                resolve();
            });
        })

        .catch(function catchError(err){
            console.log('User deletion failed:' + err);
            reject(err);
        });
    });
};

exports.findOrCreateUserProfile = function performFindOrCreate(userId, authType, displayName, firstName, lastName, email){

    //When a user is authenticated, checks to see if the user already exists in MySQL; if it doesn't,
    //this user and profile is created.
    return new Promise(function findOrCreate(resolve, reject){

        var tables = getTables();

        tables.userTable.findOrCreate({
            where: {id: userId},
            include: [{model: tables.profileTable}],
            defaults: {id: userId, authType: authType}})

        .then(function create(user){
            if (!user || user.length == 0) {
                throw new Error('User find or create failed');
            }

            if (!user[0].profile){
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
            } else {
                return user[0];
            }
        })

        .then(function finishCreate(user) {
            console.log('User find/create successful');
            resolve(user);
        })

        .catch(function catchError(err) {
            console.log('User find/create failed:' + err);
            reject(err);
        });
    });
};

exports.isUserLoggedIn = function isAuthenticated(req, res, next){

    //Determines whether the user is authenticated; if they are, execution will continue to the next middleware
    //function.  Otherwise, the user will be redirected to login.
    if (req.isAuthenticated()) {
        console.log('Authentication succeeded');
        return next();
    }
  
    console.log('Authentication failed');
    res.redirect('/');
};


