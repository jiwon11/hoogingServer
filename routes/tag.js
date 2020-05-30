const express = require('express');
const router = express.Router();

const { Tag,User } = require('../models');
const { isLoggedIn } = require('./middlewares');

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