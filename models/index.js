
const Sequelize = require('sequelize');
require('dotenv').config();
const env = 'test';
const config = require('../config/config.js');
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Account = require('./account')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Tag = require('./tag')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Patron = require('./patron')(sequelize, Sequelize);
db.MediaFile = require('./mediaFile')(sequelize, Sequelize);
db.Description = require('./description')(sequelize, Sequelize);
db.Address = require('./address')(sequelize, Sequelize);
db.Search = require('./search')(sequelize, Sequelize);


db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User);
db.User.hasMany(db.Account);
db.Account.belongsTo(db.User);
db.User.hasMany(db.Search);
db.Search.belongsTo(db.User);
db.Post.hasMany(db.MediaFile);
db.MediaFile.belongsTo(db.Post);
db.Post.hasMany(db.Description);
db.Description.belongsTo(db.Post);
db.Post.belongsTo(db.Tag);
db.Tag.hasMany(db.Post);
db.Post.belongsTo(db.Address);
db.Address.hasMany(db.Post);
db.Post.hasMany(db.Comment);
db.Comment.belongsTo(db.Post);
db.Comment.belongsToMany(db.Comment,{
  foreignKey : 'commentId',
  as : 'replys',
  through : 'Reply'
});
db.Comment.belongsTo(db.Comment,{
  foreignKey : 'replyId',
  as : 'comments',
  through : 'Reply'
});
db.User.belongsToMany(db.User, {
  foreignKey : 'followingId',
  as : 'Followers',
  through : 'UserFollow',
});
db.User.belongsToMany(db.User, {
  foreignKey : 'followerId',
  as : 'Followings',
  through : 'UserFollow',
});
db.Tag.belongsToMany(db.Tag, {
  foreignKey : 'mainTagId',
  as : 'SubTags',
  through : 'MainTagSubTag',
});
db.Tag.belongsToMany(db.Tag, {
  foreignKey : 'subTagId',
  as : 'MainTags',
  through : 'MainTagSubTag',
});
db.User.belongsToMany(db.Tag, {
  through : 'TagFollow',
});
db.Tag.belongsToMany(db.User, {
  through : 'TagFollow',
});

db.User.belongsToMany(db.Post, {
  as : 'LikePost',
  through : 'Like',
  foreignKey : 'LikerId'
});
db.Post.belongsToMany(db.User, {
  as : 'Liker',
  through : 'Like',
  foreignKey : 'LikePostId'
});
module.exports = db;
