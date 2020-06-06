var express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const{ isLoggedIn } = require('./middlewares');
const { Post,Tag,User,Comment,Like,MediaFile,Description,Product,Collection,Address } = require('../models');
const sequelize = require('sequelize');
const {Op} = require('sequelize');
var router = express.Router();
fs.readdir('profileImg', (error)=> {
  if(error) {
      console.error('profileImg 폴더가 없어 폴더를 생성합니다.');
      fs.mkdirSync('profileImg');
  }
});
/* GET users listing. */
//dump를 삼항연산자를 통해 간결한 코드 작성
router.get('/profile', isLoggedIn,async(req,res,next) => {
    //localhost:8001/user/profile?nickname=jiwon11
  try{
    const userNickname = req.query.nickname;
    if(userNickname === req.user.nickname){
      console.log('Find My Profile');
      const user = await User.findOne({
        where : { 
          nickname: userNickname
        },
        include : [{
          model : User,
          as : 'Followers',
          }, {
            model : User,
            as : 'Followings',
          },{
            model : Collection
          },{
            model : Post,
            include : [
              {
                model : Tag,
                as : 'mainTags'
              }, {
                  model : Tag,
                  as : 'subTagOnes'
              }, {
                  model : Tag,
                  as : 'subTagTwos'
              },{
                model : MediaFile,
                attributes : ['id', 'filename', 'size', 'mimetype', 'index'],
              },{
                  model : Description,
                  attributes : ['id', 'description', 'index'],
              },{
                  model : Product,
                  through : 'reviewProduct',
                  as : 'Products',
                  attributes : ['id', 'title', 'description', 'image', 'url', 'site', 'favicon'],
              },{
                model : User,
                through : 'Like',
                as : 'Likers',
                attributes : ['id', 'nickname','profileImg'],
              }
            ]
          }
        ],
        attributes : [
          'id',
          'nickname',
          'profileImg', 
          'hoogingAccountBalance',
        ]   
    });
    return res.status(200).json(user);
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
        model : Collection
      },{
      model : Post,
      include : [
        {
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
          },{
            model : Address
          }
      ],
      where :{
        dump : false,
      }
      },{
        model : Tag
      }]
      });
        return res.status(200).json({
          'user' : user,
      });
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