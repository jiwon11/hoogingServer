module.exports = (sequelize, DataTypes) => (
    sequelize.define('mediaFile',{
        originalname : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
        mimetype : {
            type : DataTypes.STRING(50),
            allowNull : false,
        },
        filename : {
            type : DataTypes.STRING(200),
            allowNull : false,
        }, 
        size : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        url : {
            type : DataTypes.STRING(400),
            allowNull : false
        },
        index : {
            type : DataTypes.INTEGER,
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);