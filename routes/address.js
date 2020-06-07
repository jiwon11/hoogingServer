const express = require('express');
const sequelize = require('sequelize');

const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product,Collection } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/', isLoggedIn, async(req,res) => {
    try{
        const address = req.query.address;
        const category = req.query.category;
        const orderType = req.query.order; //popluar | createdAt
        var order;
        if(orderType ==='popular'){
          order = [sequelize.literal('hits*1+likes*3'), 'DESC'];
        }else if(orderType === 'createdAt'){
          order = ['createdAt', 'DESC'];
        }
        if(category === 'post'){
            await Post.findAll({
              where : {
                [sequelize.Op.or] : [
                  {dump : false}
                ]
              },
              include : [{
                model : Address,
                where : {
                  address : {[sequelize.Op.substring]: address},
                }
                },{
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
        }else if(category === 'collection'){
          await Collection.findAll({
            include :[
              {
                model : Post,
                as : 'Posts',
                include : [{
                  model : Address,
                  where : {
                    address : {[sequelize.Op.substring]: address},
                  }
                  },{
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
                order : [
                  [sequelize.col('collectionPosts.index'), 'ASC']
                ]
              }
            ],
            order : [
              order
            ]
          }).then((collections) => {
            res.status(200).json(collections);
          });
        }
      } catch(error){
        console.log(error);
        res.status(404).json({
          'message' : 'Address Collection Get Error',
          'error': error
        });
      }
    });


module.exports = router;