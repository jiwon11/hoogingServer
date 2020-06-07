module.exports = (sequelize, DataTypes) => (
    sequelize.define('collectionPost',{
        index : {
            type : DataTypes.INTEGER,
        }
    }, {
        charset: 'utf-8',
        collate : 'utf8_general_ci'
    })
);