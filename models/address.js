module.exports = (sequelize, DataTypes) => (
    sequelize.define('address',{
        address : {
            type : DataTypes.STRING(200),
            allowNull : false
        },
        geographLong : {
            type : DataTypes.FLOAT,
            allowNull : false
        },
        geographLat : {
            type : DataTypes.FLOAT,
            allowNull : false
        },
        reviewNum : {
            type : DataTypes.INTEGER,
            defaultValue : 0,
            allowNull : false
        }
    }, {
        timestamps : true,
        paranoid : true,
        charset: 'utf-8',
        collate : 'utf8_general_ci'
    })
);