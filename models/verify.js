module.exports = (sequelize, DataTypes) => (
    sequelize.define('verify',{
        token : {
            type : DataTypes.STRING(30),
            allowNull : false,
        }, 
        userId : {
            type : DataTypes.STRING,
            allowNull : false,
        }, 
    }, {
        timestamps : true,
        paranoid : true
    })
);