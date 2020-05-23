module.exports = (sequelize, DataTypes) => (
    sequelize.define('patron',{
        paratonId : {
            type : DataTypes.STRING,
            allowNull : false,
        }, 
        authorId : {
            type : DataTypes.STRING,
            allowNull : false
        },
        sum : {
            type : DataTypes.INTEGER,
            allowNull : false
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);