var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const{ isLoggedIn } = require('./middlewares');
const { Post,Tag,User,Comment,Like,MediaFile,Description,Product } = require('../models');
const Sequelize = require('sequelize');
const op = Sequelize.Op;

var router = express.Router();
fs.readdir('profileImg', (error)=> {
  if(error) {
      console.error('profileImg 폴더가 없어 폴더를 생성합니다.');
      fs.mkdirSync('profileImg');
  }
});
/* GET users listing. */

router.get('/profile', async(req,res,next) => {
    //localhost:8001/user/profile?nickname=jiwon11
  try{
    const userNickname = req.query.nickname;
    if(userNickname === req.user.nickname){
      const user = await User.findOne({
        where : { nickname : userNickname },
        attributes : ['id', 'nickname', 'profileImg', 'hoogingAccountBalance'],
        include : [{
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            as : 'Followers',
        }, {
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            as : 'Followings',
        },{
        model : Post,
        where : {
          deletedAt : null,
        },
        include : [
          MediaFile,
          Description,
          Comment,
          {
            model : Product,
            as : 'Products'
          }
        ],
        },{
          model : Tag
        }
      ]
      });
      if(user){
        return res.status(200).json({
          'user' : user,
      });
      } else {
        return res.status(404).json({
          'message' : "Can't find User ",
          'error' : 'Check User Id'
      });
      }
    } else {
      const user = await User.findOne({
        where : { nickname : userNickname },
        attributes : ['id', 'nickname', 'profileImg', 'hoogingAccountBalance'],
        include : [{
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            as : 'Followers',
        }, {
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            as : 'Followings',
        },{
        model : Post,
        include : [
          MediaFile,
          Description,
          Comment,
          {
            model : Product,
            as : 'Products'
          }
        ],
        where :{
          dump : false,
          deletedAt : null,
        }
        },{
          model : Tag
        }
      ]
      });
      if(user){
        return res.status(200).json({
          'user' : user,
      });
      } else {
        return res.status(404).json({
          'message' : "Can't find User ",
          'error' : 'Check User Id'
      });
      }
    }
  } catch(error){
    console.log(error);
    return res.status(404).json({
      'message' : 'User Profile Load Error',
      'error' : error
  });
  } 
});

const profileUpdate = multer({
    storage : multer.diskStorage({
        destination(req, file, cb) {
            cb(null,'profileImg/');
        },
        filename(req, file, cb) {
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
        },
    }),
    limits : { fileSize : 20 * 1024 * 1024 },
});
router.post('/profile/update', isLoggedIn, profileUpdate.single('profileImg'), async (req, res, next) => {
    try {
      await User.update({
        nickname : req.body.nickname,
        profileImg : req.file.filename,
       },{
       where : { id : req.user.id }
      });
      res.status(200).json({
        'message' : 'profile Update Complete!'
      });
    } catch (error) {
        res.status(404).json({
            'message' : 'User Profile Update Error',
            'error' : error
        });
    }
  
  });

router.post('/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where : { id : req.user.id } });
    await user.addFollowing(req.query.userId);
    res.status(201).json({
        message : `follow User`,
    });
  } catch (error) {
        res.status(404).json({
            'message' : 'User Follow Error',
            'error' : error
        });
  }
});

router.post('/unfollow', isLoggedIn, async (req, res, next) => {
  try{
      const user = await User.findOne({ where : { id : req.user.id } });
      user.removeFollowing(req.query.userId);
      res.status(201).json({
        message : `unfollow User`
    });
  } catch (error) {
        res.status(404).json({
            'message' : 'User unFollow Error',
            'error' : error
        });
  }
});

module.exports = router;