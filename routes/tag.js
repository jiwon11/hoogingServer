const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product,Collection,CollectionPost } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', isLoggedIn, async(req,res) => {
  try{
    const tagIds = req.query.tagIds.split(',');
    const category = req.query.category;
    const orderType = req.query.order; //popluar | createdAt
    var order;
    if(orderType ==='popular'){
      order = [sequelize.literal('hits*1+likes*3'), 'DESC'];
    }else if(orderType === 'createdAt'){
      order = ['createdAt', 'DESC'];
    }
    const tagIdsInt = tagIds.map((id)=> parseInt(id,10));
    if(category === 'post'){
      if(orderType ==='popular'){
        order = [sequelize.literal('hits*1+likes*3'), 'DESC'];
      }else if(orderType === 'createdAt'){
        order = ['createdAt', 'DESC'];
      }
        await Post.findAll({
          where : {
            [sequelize.Op.or] : [
              {mainTagId : {[sequelize.Op.or]: tagIdsInt}},
              {subTagOneId : {[sequelize.Op.or]: tagIdsInt}},
              {subTagTwoId : {[sequelize.Op.or]: tagIdsInt}},
            ],
            dump : false
          },
          include : [{
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            }, {
                model : Tag,
                as : 'mainTags'
            }, {
                model : Tag,
                as : 'subTagOnes'
            }, {
                model : Tag,
                as : 'subTagTwos'
            }, {
            model : User,
            through : 'Like',
            as : 'Likers',
            attributes : ['id', 'nickname','profileImg'],
            }, {
                model : MediaFile,
                attributes : ['id', 'filename', 'size', 'mimetype', 'index'],
            },
            {
                model : Description,
                attributes : ['id', 'description', 'index'],
            },
            {
                model : Product,
                through : 'reviewProduct',
                as : 'Products',
                attributes : ['id', 'title', 'description', 'image', 'url', 'site', 'favicon'],
            }
          ],
          attributes: {
            include: [
              [sequelize.literal('hits*1+likes*3'), 'popular']
            ]
          },
          order : [
            order
          ]
        }).then((posts) => {
          res.status(200).json(posts);
        });
    } else if(category === 'collection'){
      if(orderType ==='popular'){
        order = ['Like', 'DESC'];
      }else if(orderType === 'createdAt'){
        order = ['createdAt', 'DESC'];
      }
      const tagIdsName = await Promise.all(tagIdsInt.map(async (tagId) => {
        const tag = await Tag.findOne({ where : { id : tagId },attributes : ['name'] });
        return tag.name;
      }));
      const tagEqColName = await Collection.findAll({
        where : {
            [sequelize.Op.or]: [
              {name : {[sequelize.Op.substring]: tagIdsName[0]}},
              {name : {[sequelize.Op.substring]: tagIdsName[1]}},
              {name : {[sequelize.Op.substring]: tagIdsName[2]}}
            ]
        },
        include :[
          {
            model : Post,
            as : 'Posts',
            where : {
              dump : false
            },
            include : [{
              model : User,
              attributes : ['id', 'nickname','profileImg'],
              }, {
                  model : Tag,
                  as : 'mainTags'
              }, {
                  model : Tag,
                  as : 'subTagOnes'
              }, {
                  model : Tag,
                  as : 'subTagTwos'
              }, {
              model : User,
              through : 'Like',
              as : 'Likers',
              attributes : ['id', 'nickname','profileImg'],
              }, {
                  model : MediaFile,
                  attributes : ['id', 'filename', 'size', 'mimetype', 'index'],
              },
              {
                  model : Description,
                  attributes : ['id', 'description', 'index'],
              },
              {
                  model : Product,
                  through : 'reviewProduct',
                  as : 'Products',
                  attributes : ['id', 'title', 'description', 'image', 'url', 'site', 'favicon'],
              }
            ],
          }
        ],
        order : [
          order,
          [{model:Post, as:'Posts'},CollectionPost,'index','ASC']
        ]
      });
      const tagNeqColName = await Collection.findAll({
        include :[
          {
            model : Post,
            as : 'Posts',
            where : {
              [sequelize.Op.or] : [
                {mainTagId : {[sequelize.Op.or]: tagIdsInt}},
                {subTagOneId : {[sequelize.Op.or]: tagIdsInt}},
                {subTagTwoId : {[sequelize.Op.or]: tagIdsInt}},
              ],
              dump : false
            },
            order :  [[sequelize.col('collectionPost.index'), 'ASC']],
            include : [{
              model : User,
              attributes : ['id', 'nickname','profileImg'],
              }, {
                  model : Tag,
                  as : 'mainTags'
              }, {
                  model : Tag,
                  as : 'subTagOnes'
              }, {
                  model : Tag,
                  as : 'subTagTwos'
              }, {
              model : User,
              through : 'Like',
              as : 'Likers',
              attributes : ['id', 'nickname','profileImg'],
              }, {
                  model : MediaFile,
                  attributes : ['id', 'filename', 'size', 'mimetype', 'index'],
              },
              {
                  model : Description,
                  attributes : ['id', 'description', 'index'],
              },
              {
                  model : Product,
                  through : 'reviewProduct',
                  as : 'Products',
                  attributes : ['id', 'title', 'description', 'image', 'url', 'site', 'favicon'],
              }
            ],
          }
        ],
        order : [
          order,
          [{model:Post, as:'Posts'},CollectionPost,'index','ASC']
        ]
      });
      const collection = await tagEqColName.concat(tagNeqColName);
      const uniCollection = Array.from(new Set(collection.map(a => a.id)))
      .map(id => {
        return collection.find(a => a.id === id);
      });
      res.status(200).json(uniCollection);
    }
  } catch(error){
    console.log(error);
    res.status(404).json({
      'message' : 'Tag Post Get Error',
      'error': error
    });
  }
});


router.post('/follow',isLoggedIn ,async (req,res, next) => {
  //localhost:8001:/tag/follow?tagId=1
    try {
        const tag = await Tag.findOne({ where : { id : req.query.tagId } });
        const user = await User.findOne({ where : { id : req.user.id }, attributes:['id', 'nickname', 'profileImg'] });
        await user.addTag(parseInt(tag.id, 10));
        return res.status(201).json({
            'message' : `Follow Tag`,
            'user' : user,
            'tag' : tag
        });
      } catch (error) {
        console.log(error);
        return res.status(404).json({
          'message' : 'Tag Follow Error',
          'error' : error
      });
      }
});

router.delete('/unfollow', isLoggedIn, async (req, res, next) => {
  //localhost:8001:/tag/unfollow?tagId=1
    try{
        const tag = await Tag.findOne({ where : { id : req.query.tagId }});
        const user = await User.findOne({ where : { id : req.user.id } , attributes:['id', 'nickname', 'profileImg']});
        await user.removeTag(parseInt(tag.id, 10));
        return res.status(201).json({
          'message' : `UnFollow Tag`,
          'user' : user,
          'tag' : tag
      });
    } catch (error) {
      return res.status(404).json({
        'message' : 'Tag unFollow Error',
        'error' : error
    });
    }
  });

module.exports = router;