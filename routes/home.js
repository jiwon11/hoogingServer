const express = require('express');
const {isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description } = require('../models');
const router = express.Router();


router.get('/',isLoggedIn, async(req, res, next) => {
  try{
    const dump =  await Post.findAll({
      where: {
        userId : req.user.id,
        dump :true
      },
      order : [
        ['createdAt', 'DESC']
      ]
    });
    return res.status(200).json({
      'message' : 'hoogingApp Main Page',
      'dump' : dump
    });
  } catch(error){
    console.log(error);
    res.status(404).json({
      'message' : '',
      'error' : error
    });
  }
});

module.exports = router;