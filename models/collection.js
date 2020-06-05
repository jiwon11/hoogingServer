module.exports = (sequelize, DataTypes) => (
    sequelize.define('collection',{
        name : {
            type : DataTypes.STRING(200),
            allowNull : false,
        }, 
        Like : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        open : {
            type : DataTypes.STRING(10),
            allowNull : false,
        },
    }, {
        timestamps : true,
        paranoid : true
    })
);