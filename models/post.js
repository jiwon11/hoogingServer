module.exports = (sequelize, DataTypes) => (
    sequelize.define('post',{
        title : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        description : {
            type : DataTypes.STRING(5000),
            allowNull : false,
        },
        media : {
            type : DataTypes.STRING(200),
            allowNull : false
        },
        starRate : {
            type : DataTypes.DOUBLE,
            allowNull: false
        },
        expense : {
            type : DataTypes.INTEGER,
            allowNull : true
        }, 
        adress : {
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
        certifiedLocation : {
            type : DataTypes.BOOLEAN,
            allowNull : false
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);