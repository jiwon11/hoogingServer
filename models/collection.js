module.exports = (sequelize, DataTypes) => (
    sequelize.define('collection',{
        name : {
            type : DataTypes.STRING(200),
            allowNull : false,
        }, 
    }, {
        timestamps : true,
        paranoid : true
    })
);