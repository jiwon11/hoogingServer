module.exports = (sequelize, DataTypes) => (
    sequelize.define('post',{
        starRate : {
            type : DataTypes.DOUBLE,
            allowNull: false
        },
        expense : {
            type : DataTypes.INTEGER,
            allowNull : true
        }, 
        certifiedLocation : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        },
        hits : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        }, 
        sequence : {
            type : DataTypes.STRING(1000),
            allowNull : false,
        },
        dump : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        }
    }, {
        timestamps : true,
        paranoid : true,
        charset: 'utf8',
        collate: 'utf8_general_ci'
    })
);