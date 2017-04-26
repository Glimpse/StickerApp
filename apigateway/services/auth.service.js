var Sequelize = require('sequelize');
var dbConnection = require('../config/database-config').dbConnection;
var userModel = require('../models/user');
var profileModel = require('../models/profile');

var getTables = (function getTables(){
    var tables = null;

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

    return function initSequelize() {
        if (!dbSequelize) {
            dbSequelize = new Sequelize(
                dbConnection.database, dbConnection.username, dbConnection.password, {
                    port: dbConnection.port,
                    dialect: 'mysql',
                    host: dbConnection.host
                });
        }
        return dbSequelize;
    };
})();

function connectToAuthDb(){

    return new Promise(function connect(resolve, reject) {

         //TODO: database must already be created; need to be this info in the docs on how to run a MySQL docker container
        //and also how to create a database
        getSequelize().authenticate()

        .then(function finishConnect(err) {
            console.log('Connection has been established successfully.');
            resolve(getSequelize());
        })

        .catch(function catchError(err) {
            console.log('Unable to connect to the database:', err);
            reject(err);
        });
    });
}

function createUserProfileSchema(){

    return new Promise(function defineTables(resolve, reject){

        //Get the table definitions and add relationships
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

    return new Promise(function (resolve, reject){

        findUserProfile(userId)

        .then(function destroy(user){
            user.destroy()
            .then(function finishDestroy(){
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

exports.findOrCreateUserProfile = function(userId, authType, displayName, firstName, lastName, email){

    return new Promise(function (resolve, reject){

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
            }
            else {
                return user[0];
            }
        })

        .then(function(user) {
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

    if (req.isAuthenticated()) {
        console.log('Authentication succeeded');
        return next();
    }
  
    console.log('Authentication failed');
    res.redirect('/');
};


