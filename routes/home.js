const express = require('express');
const {isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description } = require('../models');
const sequelize = require('sequelize');
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

router.get('/address', isLoggedIn, async(req,res,next)=> {
  try{
    const long = req.query.long;
    const lat = req.query.lat;
    const radius = req.query.radius;
    const posts = await Post.findAll({
      include : [
        {
          model : Address,
          where : sequelize.literal(`(6371*acos(cos(radians(${lat}))*cos(radians(geographLat))*cos(radians(geographLong)-radians(${long}))+sin(radians(${lat}))*sin(radians(geographLat))))<=${radius}`)
        }
      ],
      where : {
        dump : false,
        certifiedLocation : true,
      },
      attributes: {
        include: [
          [sequelize.literal('hits*1+likes*3'), 'popular']
        ]
      },
      order : [['createdAt', 'DESC']]
    });
    return res.status(200).json(posts);
  } catch(error){
    console.log(error);
    res.status(404).json(error);
  }
});
module.exports = router;