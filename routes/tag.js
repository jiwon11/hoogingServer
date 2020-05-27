const express = require('express');
const router = express.Router();

const { Tag,User } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.post('/:tag/follow',isLoggedIn ,async (req,res, next) => {
    try {
        const tag = await Tag.find({ where : { name : req.params.tag } });
        const user = await User.find({ where : { id : req.user.id } });
        console.log(`user : ${user.nickname} follow tag : ${tag},`);
        await user.addtags(parseInt(tag.id, 10));
        res.status(201).json({
            'message' : `${user.nickname} follow ${tag.name} Tag`
        });
      } catch (error) {
        res.status(404).json({
          'message' : 'Tag Follow Error',
          'error' : error
      });
        next(error);
      }
});

router.post('/:tag/unfollow', isLoggedIn, async (req, res, next) => {
    try{
        const tag = await Tag.find({ where : { name : req.params.tag } });
        const user = await User.find({ where : { id : req.user.id } });
        await user.removetags(parseInt(tag.id, 10));
        res.status(201).json({
          'message': `${user.nickname} unfollow ${tag.name} Tag`
      });
    } catch (error) {
      res.status(404).json({
        'message' : 'Tag unFollow Error',
        'error' : error
    });
        next(error);
    }
  });

module.exports = router;