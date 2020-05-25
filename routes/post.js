const express = require('express');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');

const { Post, Tag, User, MediaFile } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

fs.readdir('uploads', (error) => {
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});
/*
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'hoogingpostmedia',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});
*/
const upload = multer({
    storage: multer.diskStorage({
        destination(req,file,cb) {
            cb(null, 'uploads/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext) + new Date().valueOf() + ext);
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
  });

const upload2 = multer();
router.post('/upload', upload.array('mediaFile'), async (req, res, next) => {
    console.log(req.files);
    try {
        var includeVideoList = [];
        for (var file in req.files) {
            if ('video/mp4' === file.minetype){
                includeVideoList.push(true);
            } else {
                includeVideoList.push(false);
            }
        }
        var includeVideo;
        if (true in includeVideoList) {
            includeVideo = true;
        } else {
            includeVideo = false;
        }
        const post = await Post.create({
            userId: 1, //req.user.id
            title : req.body.title,
            description : req.body.description,
            includeVideo : includeVideo,
            starRate: parseFloat(req.body.starRate),
            address: req.body.address,
            geographLong: parseFloat(req.body.geographLong),
            geographLat: parseFloat(req.body.geographLat),
            certifiedLocation: Boolean(req.body.certifiedLocation),
        });
        await Promise.all(req.files.map(file => MediaFile.create({
            originalname : file.originalname,
            mimetype : file.mimetype,
            filename : file.filename,
            size : file.size,
            postId : post.id
        })));
        const mainTagResults = await Tag.findOrCreate({
            where : {name : req.body.mainTag}
        });
        const mainTagResult = mainTagResults[0];
        var reviewNum = mainTagResult.reviewNum+1;
        var starRate = (mainTagResult.reviewNum*mainTagResult.starRate+req.body.starRate)/reviewNum;
        await Tag.update(
            {
            starRate : starRate,
            reviewNum : reviewNum
          },
          {where : {
              id : mainTagResult.id
          }}
        );
    await post.addTags(mainTagResult);
    if(req.body.subTag1){
        var subTag1 = await Tag.findOrCreate({
            where : {name : req.body.subTag1}
        });
        await mainTagResult.addSubTag(parseInt(subTag1[0].id,10));
    }
    if(req.body.subTag2){
        var subTag2 = await Tag.findOrCreate({
            where : {name : req.body.subTag2}
        });
        await mainTagResult.addSubTag(parseInt(subTag2[0].id,10));
    }
    Post.findOne({
        where : {
            id : post.id
        },
        include : [{
            model : User,
            attributes : ['id','nickname','profileImg'],
        },
        {
            model : MediaFile,
            attributes : ['filename', 'size', 'mimetype'],
        },
        {
            model : Tag,
            attributes : ['name', 'starRate', 'reviewNum'],
            include : [{model : Tag, as : 'SubTags',attributes : ['name', 'starRate', 'reviewNum']}]
        }
        ]
    })
    .then(post => res.status(201).json({
        'message' : 'Create New Post!',
        'post' : post
    }))
    .catch(err => next(err));
    } catch (error) {
      console.error(error);
      next(error);
    }
});

module.exports = router;