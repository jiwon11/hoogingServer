module.exports = (sequelize, DataTypes) => (
    sequelize.define('like',{
        userId : {
            type : DataTypes.STRING(50),
            allowNull : false,
        }, 
        postId : {
            type : DataTypes.INTEGER,
        },
        likeNum : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);