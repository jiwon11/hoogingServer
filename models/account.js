module.exports = (sequelize, DataTypes) => (
    sequelize.define('account',{
        num : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
    }, {
        timestamps : true,
        paranoid : true
    })
);