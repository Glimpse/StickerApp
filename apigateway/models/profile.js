const Sequelize = require('sequelize');

module.exports = function defineProfile(sql) {
    var profile = sql.define('profile', {
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

    return { profile };
};

