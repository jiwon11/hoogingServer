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
        paranoid : true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
);