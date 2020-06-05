const express = require('express');
const router = express.Router();
const {Op} = require('sequelize');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', isLoggedIn, async(req,res) => {
  try{
    const tagIds = req.query.tagIds.split(',');
    const category = req.query.category;
    const order = req.query.order; //hits | createdAt
    const tagIdsInt = tagIds.map((id)=> parseInt(id,10));
    if(category === 'post'){
        const posts = await Post.findAll({
          where : {
            [Op.or] : [
              {mainTagId : {[Op.or]: tagIdsInt}},
              {subTagOneId : {[Op.or]: tagIdsInt}},
              {subTagTwoId : {[Op.or]: tagIdsInt}},
            ]
          },
          order : [
            [order, 'DESC']
          ]
        });
      return res.status(200).json(posts);
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