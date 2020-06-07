
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
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
db.Product = require('./product')(sequelize, Sequelize);
db.Verify = require('./verify')(sequelize, Sequelize);
db.Collection = require('./collection')(sequelize, Sequelize);
db.CollectionPost = require('./collectionPost')(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User,{ onDelete: 'CASCADE'});
db.User.hasMany(db.Comment);
db.Comment.belongsTo(db.User,{ onDelete: 'CASCADE'});
db.User.hasMany(db.Account);
db.Account.belongsTo(db.User,{ onDelete: 'CASCADE'});
db.User.hasMany(db.Search);
db.Search.belongsTo(db.User,{ onDelete: 'CASCADE'});
db.Post.hasMany(db.MediaFile);
db.MediaFile.belongsTo(db.Post,{ onDelete: 'CASCADE'});
db.Post.hasMany(db.Description);
db.Description.belongsTo(db.Post,{ onDelete: 'CASCADE'});
db.Post.belongsTo(db.Tag, { as:'mainTags', foreignKey: 'mainTagId'});
db.Post.belongsTo(db.Tag, { as:'subTagOnes', foreignKey: 'subTagOneId'});
db.Post.belongsTo(db.Tag, { as:'subTagTwos', foreignKey: 'subTagTwoId'});
db.Tag.hasMany(db.Post);
db.Post.belongsTo(db.Address);
db.Address.hasMany(db.Post);
db.Post.hasMany(db.Comment);
db.Comment.belongsTo(db.Post,{ onDelete: 'CASCADE'});
db.Comment.belongsToMany(db.Comment,{
  foreignKey : 'commentId',
  as : 'replys',
  through : 'Reply'
});
db.Comment.belongsTo(db.Comment,{
  foreignKey : 'replyId',
  as : 'comments',
  through : 'Reply', 
  onDelete: 'CASCADE'
});
db.User.belongsToMany(db.User, {
  foreignKey : 'followingId',
  as : 'Followers',
  through : 'UserFollow',
  onDelete: 'CASCADE'
});
db.User.belongsToMany(db.User, {
  foreignKey : 'followerId',
  as : 'Followings',
  through : 'UserFollow',
  onDelete: 'CASCADE'
});
db.User.belongsToMany(db.Tag, {
  through : 'TagFollow',
});
db.Tag.belongsToMany(db.User, {
  through : 'TagFollow',
});
db.User.belongsToMany(db.Post, {
  as : 'LikePosts',
  through : 'Like',
  foreignKey : 'LikerId'
});
db.Post.belongsToMany(db.User, {
  as : 'Likers',
  through : 'Like',
  foreignKey : 'LikePostId'
});
db.User.belongsToMany(db.Post, {
  as : 'ScrapPosts',
  through : 'Scrap',
  foreignKey : 'userId'
});
db.Post.belongsToMany(db.User, {
  as : 'Scrapers',
  through : 'Scrap',
  foreignKey : 'ScrapPostId'
});
db.Product.belongsToMany(db.Post, {
  foreignKey : 'productId',
  as : 'ProductPosts',
  through : 'reviewProduct',
});
db.Post.belongsToMany(db.Product, {
  foreignKey : 'postId',
  as : 'Products',
  through : 'reviewProduct',
});
db.User.hasMany(db.Collection);
db.Collection.belongsTo(db.User,{ onDelete: 'CASCADE'});
db.Collection.belongsToMany(db.Post, {
  foreignKey : 'collectionId',
  as : 'Posts',
  through : db.CollectionPost,
});
db.Post.belongsToMany(db.Collection, {
  foreignKey : 'postId',
  as : 'Collections',
  through : db.CollectionPost,
});
module.exports = db;
