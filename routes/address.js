const express = require('express');
const router = express.Router();

const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product } = require('../models');
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
            await Post.findAll({
              where : {
                [sequelize.Op.or] : [
                  {mainTagId : {[sequelize.Op.or]: tagIdsInt}},
                  {subTagOneId : {[sequelize.Op.or]: tagIdsInt}},
                  {subTagTwoId : {[sequelize.Op.or]: tagIdsInt}},
                  {dump : false}
                ]
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
        }else if(category === 'collection'){
        }
      } catch(error){
        console.log(error);
        res.status(404).json({
          'message' : 'Tag Post Get Error',
          'error': error
        });
      }
    });


module.exports = router;