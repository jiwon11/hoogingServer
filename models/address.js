module.exports = (sequelize, DataTypes) => (
    sequelize.define('address',{
        address : {
            type : DataTypes.STRING(200),
            allowNull : true
        },
        geographLong : {
            type : DataTypes.FLOAT,
            allowNull : true
        },
        geographLat : {
            type : DataTypes.FLOAT,
            allowNull : true
        },
    }, {
        timestamps : true,
        paranoid : true,
        charset:'utf8',
        collate:'utf8_unicode_ci',
    })
);