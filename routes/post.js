const express = require('express');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const sequelize = require('sequelize');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description } = require('../models');
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

const includeVideo = function includeVideo(files) {
    var includeVideoList = [];
    var includeVideo;
        for (var file in files) {
            if ('video/mp4' === file.minetype){
                includeVideoList.push(true);
            } else {
                includeVideoList.push(false);
            }
        }
        if (true in includeVideoList) {
            includeVideo = true;
        } else {
            includeVideo = false;
        }
    return includeVideo;
};

function getIndex(ele) {
    var _i = 0;
    while((ele = ele.previousSibling) != null ) {
      _i++;
    }
  
    return _i;
  }

const upload2 = multer();
router.post('/upload', isLoggedIn ,upload.array('mediaFile'), async (req, res, next) => {
    console.log(req.files);
    try {
        const address = await Address.create({
            address: req.body.address,
            geographLong: parseFloat(req.body.geographLong),
            geographLat: parseFloat(req.body.geographLat),
        });
        const mainTagResults = await Tag.findOrCreate({
            where : {name : req.body.mainTag}
        });
        const mainTagResult = mainTagResults[0];
        var reviewNum = mainTagResult.reviewNum+1;
        var starRate = (parseFloat(mainTagResult.reviewNum)*parseFloat(mainTagResult.starRate)+parseFloat(req.body.starRate))/parseFloat(reviewNum);
        await Tag.update(
            {
            starRate : starRate,
            reviewNum : sequelize.literal('reviewNum + 1'),
          },
          {where : {
              id : mainTagResult.id
          }}
        );
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
        const post = await Post.create({
            userId: req.user.id,
            title : req.body.title,
            description : '',
            includeVideo : includeVideo(req.files),
            starRate: parseFloat(req.body.starRate),
            certifiedLocation: (req.body.certifiedLocation ==='true'),
            addressId : address.id,
            tagId : mainTagResult.id,
            sequence : req.body.sequence,
            dump : (req.body.dump ==='true')
        });
        console.log('===================================================');
        const descriptions = JSON.parse(req.body.description);
        const sequence = Array.from(req.body.sequence);
        var i = 0, len = sequence.length;
        do {
            if(sequence[i] === 'D'){
                var description = descriptions[0];
                console.log('sequence is Description');
                await Description.create({
                    description: description,
                    index : i+1,
                    postId : post.id
                }).then(function(){
                    descriptions.splice(description,1);
                });
            }else{
                console.log('sequence is Mediafile');
                var file = req.files[0];
                await MediaFile.create({
                    originalname : file.originalname,
                    mimetype : file.mimetype,
                    filename : file.filename,
                    size : file.size,
                    postId : post.id,
                    index : i+1
                }).then(function(){
                    req.files.splice(file,1);
                });
            }
            i++; 
        } while (i < len);
    return res.status(201).json({
        'message' : 'Create New Post!',
        'post' : post
    });
    } catch (error) {
      console.error(error);
      next(error);
    }
});

router.get('/', isLoggedIn ,async (req, res, next) => {
    const postId = req.query.postId;
    if(!postId) {
        return res.status(404).json({
            'message' : 'Not Found Params',
        });
    }
    try{
    const post = await Post.findOne({ 
        where : { id : postId },
        include : [{
            model : User,
            attributes : ['id', 'nickname','profileImg'],
            }, {
                model : Tag,
            },{
            model : User,
            through : 'Like',
            as : 'Liker',
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
                model : Tag,
                attributes : ['name', 'starRate', 'reviewNum'],
                include : [{model : Tag, as : 'SubTags',attributes : ['name', 'starRate', 'reviewNum']}]
            }
        ], 
     });
     if(post){
        if(req.user.id !== post.userId){
            await post.update(
                { field: sequelize.literal(' hits + 1') },
                { where: { id : postId} }
              );
         }
        const comments = await Comment.findAll({
            where : { postId : postId },
            include : [
                {
                model : User,
                attributes : ['id', 'nickname','profileImg'],
            }, {
                model : Comment,
                through : 'Reply',
                as : 'replys',
            }
        ]
        });
        return res.status(200).json({
            'post' : post,
            'commets' : comments,
        });
     }else {
        return res.status(404).json({
            'message' : "Can't find Post!!",
            'error' : 'check postId',
        });
     }
    } catch (error) {
    console.error(error);
    return next(error);
    }
});

router.delete('/delete', isLoggedIn, async (req, res, next) => {
    try{
        await Post.destroy({ where : { id : req.query.postId } });
        await MediaFile.destroy({ where : { postId : req.query.postId}});
        return res.status(204).json({
            'message' : 'DELETE Post!',
        });
    } catch(error){
        console.log(error);
        return res.status(204).json({
            'message' : 'DELETE Post!',
            'error' : error
        });
    }
});

router.delete('/mediaFile/delete', isLoggedIn, async(req, res, next) => {
    try{
        const mediaFileId = req.query.mediaFileId;
        const postId = req.query.postId;
        MediaFile.destroy({
            where : {
                id : mediaFileId,
                postId : postId
            }
        });
        res.status(204).json({
            'message' : 'Delete Post MediaFile'
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Delete Post MediaFile Error',
            'error' : error
        });
    }
});

router.post('/update', isLoggedIn, upload.array('mediaFile'), async (req, res, next) => {
    const postId = req.query.postId;
    console.log(req.body);
    /* sequence에 맞는 이미지와 글을 정렬하는 코드 추가*/
    try {
        const dump = (req.body.dump==='true');
        const certifiedLocation = (req.body.certifiedLocation ==='true');
        var post;
        if(req.body.address){
            const address = await Address.findOrCreate({
                where:{
                    address: req.body.address,
                    geographLong: parseFloat(req.body.geographLong),
                    geographLat: parseFloat(req.body.geographLat),
                }
            });
            post = await Post.update({ 
                title : req.body.title,
                description : req.body.description,
                includeVideo : includeVideo(req.files),
                starRate: parseFloat(req.body.starRate),
                certifiedLocation: certifiedLocation,
                addressId : address.id,
                sequence : req.body.sequence,
                dump : dump
            }, 
            { 
                where: { id :  postId } 
            });
        }else{
            post = await Post.update({ 
                title : req.body.title,
                description : req.body.description,
                includeVideo : includeVideo(req.files),
                starRate: parseFloat(req.body.starRate),
                certifiedLocation: certifiedLocation,
                dump : dump
            }, 
            { 
                where: { id :  postId } 
            });
        }
        const descriptions = JSON.parse(req.body.description);
        const sequence = Array.from(req.body.sequence);
        var i = 0, len = sequence.length;
        do {
            if(sequence[i] === 'D'){
                var description = descriptions[0];
                console.log('sequence is Description');
                await Description.create({
                    description: description,
                    index : i+1,
                    postId : postId
                }).then(function(){
                    descriptions.splice(description,1);
                });
            }else{
                console.log('sequence is Mediafile');
                var file = req.files[0];
                await MediaFile.create({
                    originalname : file.originalname,
                    mimetype : file.mimetype,
                    filename : file.filename,
                    size : file.size,
                    postId : postId,
                    index : i+1
                }).then(function(){
                    req.files.splice(file,1);
                });
            }
            i++; 
        } while (i < len);
        if(req.body.mainTag){
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
        }
        return res.status(200).json({
            'message' : 'Update Post!',
            'post' : post
        });
    } catch (error) {
        console.error(error);
        return res.status(404).json({
            'message' : 'Update Post Error',
            'error' : error
        });
    }
});

module.exports = router;