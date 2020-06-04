module.exports = (sequelize, DataTypes) => (
    sequelize.define('product',{
        title : {
            type : DataTypes.STRING(200),
            allowNull : false,
        }, 
        description : {
            type : DataTypes.STRING(200),
            allowNull : false,
        },
        image : {
            type : DataTypes.STRING(200),
            allowNull : false,
        },
        url : {
            type : DataTypes.STRING(200),
            allowNull : false,
        },
        site : {
            type : DataTypes.STRING(20),
            allowNull : false,
        },
        favicon : {
            type : DataTypes.STRING(200),
            allowNull : false,
        }
    }, {
        timestamps : true,
        paranoid : true,
        charset: 'utf-8',
        collate : 'utf8_general_ci'
    })
);