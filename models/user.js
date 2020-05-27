

module.exports = (sequelize, DataTypes) => (
    sequelize.define('user',{
        id : {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true,
            allowNull : false
        },
        email : {
            type : DataTypes.STRING(50),
            allowNull : false,
            unique : true
        },
        password : {
            type : DataTypes.STRING(100),
            allowNull : true,
        },
        nickname : {
            type : DataTypes.STRING(20),
            allowNull : false
        },
        birthdate : {
            type : DataTypes.DATEONLY,
            allowNull: false
        },
        gender : {
            type : DataTypes.STRING(10),
            allowNull : false
        }, 
        profileImg : {
            type : DataTypes.STRING(200),
            defaultValue : ''
        },
        provider : {
            type : DataTypes.STRING(30),
            defaultValue : 'local'
        },
        socialId : {
            type : DataTypes.STRING(50),
            allowNull : true
        },
        hoogingAccountBalance : {
            type : DataTypes.INTEGER,
            defaultValue : 0
        },
        awsSnsEndpoint : {
            type : DataTypes.STRING(100),
            allowNull : true
        }
    }, {
        timestamps : true,
        paranoid : true
    })
);