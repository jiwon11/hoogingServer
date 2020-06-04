module.exports = (sequelize, DataTypes) => (
    sequelize.define('description',{
        description : {
            type : DataTypes.STRING(5000),
            allowNull : false,
        }, 
        index : {
            type : DataTypes.INTEGER,
        }, 
    }, {
        timestamps : true,
        paranoid : true,
        charset: 'utf-8',
        collate : 'utf8_general_ci'
    })
);