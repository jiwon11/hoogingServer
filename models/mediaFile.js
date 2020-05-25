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
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);