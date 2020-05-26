module.exports = (sequelize, DataTypes) => (
    sequelize.define('search',{
        query : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
        category : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
    }, {
        timestamps : true,
        paranoid : true
    })
);