const Sequelize = require('sequelize');

module.exports = function defineUser(sequelize)
{
    var user = sequelize.define('user', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true
        },
        authType: Sequelize.STRING
    },
    {   classMethods: {
        associate: function associate(profile) {
            user.hasOne(profile, { onDelete: 'cascade', hooks:true});
        }
    }
    });

    return  { user };
};