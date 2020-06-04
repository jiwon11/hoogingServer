module.exports = (sequelize, DataTypes) => (
    sequelize.define('tag',{
        name : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
        starRate : {
            type : DataTypes.FLOAT,
            defaultValue : 0.0
        },
        reviewNum : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        }
    }, {
        timestamps : true,
        paranoid : true,
        charset: 'utf-8',
        collate : 'utf8_general_ci'
    })
);