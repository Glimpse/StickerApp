var Sequelize = require('sequelize');

module.exports = function defineProfile(sequelize)
{
    var profile = sequelize.define('profile', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        displayName: Sequelize.STRING,
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING
    },
        {
            classMethods: {
                associate: function associate(user){
                    profile.belongsTo(user);
                }
            }
        });

    return { Profile: profile};
};

