module.exports = (sequelize, DataTypes) => (
    sequelize.define('comment',{
        description : {
            type : DataTypes.STRING(5000),
            allowNull : false,
        }, 
        Like : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);