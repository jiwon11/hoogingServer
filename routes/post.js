const express = require('express');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const sequelize = require('sequelize');
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require('iconv-lite');
const charset = require('charset');
const Url = require('url');
const {Op} = require('sequelize');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();
/*
post를 include 하는 경우가 많으므로 post 로드용 객체를 모듈로 생성
 */
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

const upload2 = multer();
router.post('/upload', isLoggedIn ,upload.array('mediaFile'), async (req, res, next) => {
    console.log(req.files);
    try {
        const [address, created] = await Address.findOrCreate({
            where : {
                address: req.body.address,
            },
            defaults : {
                geographLong: parseFloat(req.body.geographLong),
                geographLat: parseFloat(req.body.geographLat),
                reviewNum : sequelize.literal('reviewNum + 1'),
            }
        });
        if(created === false){
            await address.increment({'reviewNum': 1});
        }
        const mainTagResults = await Tag.findOrCreate({
            where : {name : req.body.mainTag}
        });
        const mainTagResult = mainTagResults[0];
        var starRate = (parseFloat(mainTagResult.reviewNum)*parseFloat(mainTagResult.starRate)+parseFloat(req.body.starRate))/(parseFloat(mainTagResult.reviewNum)+1);
        console.log('starRate :', starRate);
        await Tag.update(
            {
            starRate : starRate,
            reviewNum : sequelize.literal('reviewNum + 1'),
          },
          {where : {
              id : mainTagResult.id
          }}
        );
        var subTag1;
        if(req.body.subTag1){
            subTag1 = await Tag.findOrCreate({
                where : {name : req.body.subTag1}
            });
            await Tag.update(
                {
                reviewNum : sequelize.literal('reviewNum + 1'),
              },
              {where : {
                  id : subTag1[0].id
              }}
            );
        }
        var subTag2;
        if(req.body.subTag2){
            subTag2 = await Tag.findOrCreate({
                where : {name : req.body.subTag2}
            });
            await Tag.update(
                {
                reviewNum : sequelize.literal('reviewNum + 1'),
              },
              {where : {
                  id : subTag2[0].id
              }}
            );
        }
        const post = await Post.create({
            userId: req.user.id,
            title : req.body.title,
            description : '',
            includeVideo : includeVideo(req.files),
            starRate: parseFloat(req.body.starRate),
            certifiedLocation: (req.body.certifiedLocation ==='true'),
            addressId : address.id,
            mainTagId : mainTagResult.id,
            subTagOneId : subTag1[0].id,
            subTagTwoId : subTag2[0].id,
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
        var products = JSON.parse(req.body.products);
        products = Array.from(products);
        for(const prod of products){
            const product = await Product.findOrCreate({
                where :{
                title : prod['title'],
                description : prod['description'],
                image : prod['image'],
                url : prod['url'],
                site : prod['site'],
                favicon : prod['favicon']
                }
            });
            await post.addProduct(product[0].id);
        }
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
        where : { id : postId,
            deletedAt : null, 
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
            },
            {
                model : Address
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
            order : ['createdAt', 'DESC'],
            include : [
                {
                model : User,
                attributes : ['id', 'nickname','profileImg'],
            }, {
                model : Comment,
                through : 'Reply',
                as : 'replys',
                order : ['createdAt', 'DESC'],
            }
        ]
        });
        return res.status(200).json({
            'post' : post,
            'commets' : comments,
        });
     }else {
        return res.status(404).json({
            'message' : 'Find post Error',
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
    /* sequence에 맞는 이미지와 글을 정렬하는 코드 추가*/
    try {
        const dump = (req.body.dump==='true');
        const certifiedLocation = (req.body.certifiedLocation ==='true');
        const [address,creared] = await Address.findOrCreate({
            where:{
                address: req.body.address,
                geographLong: parseFloat(req.body.geographLong),
                geographLat: parseFloat(req.body.geographLat),
            }
        });

        const post = await Post.findByPk(postId);
        await post.update({ 
            title : req.body.title,
            description : req.body.description,
            includeVideo : includeVideo(req.files),
            starRate: parseFloat(req.body.starRate),
            certifiedLocation: certifiedLocation,
            addressId : address.id,
            sequence : req.body.sequence,
            dump : dump
        });
        
        await MediaFile.destroy({
            where : {
                postId : postId
            }
        });
        await Description.destroy({
            where : {
                postId : postId
            }
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
                    postId : post.id,
                    index : i+1
                }).then(function(){
                    req.files.splice(file,1);
                });
            }
            i++; 
        } while (i < len);
        var products = JSON.parse(req.body.products);
        products = Array.from(products);
        const previousProduct = await Product.findAll({
            include : [{
                model : Post,
                through : 'reviewProduct',
                as : 'ProductPosts',
                where : {
                    id : postId
                }
            }]
        });
        await post.removeProduct(previousProduct)
        .then(async()=>{
            for(const prod of products){
                const product = await Product.findOrCreate({
                    where :{
                    title : prod['title'],
                    description : prod['description'],
                    image : prod['image'],
                    url : prod['url'],
                    site : prod['site'],
                    favicon : prod['favicon']
                    }
                });
                await post.addProduct(product[0].id);
            }
        });
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

router.post('/scrap', isLoggedIn, async(req,res,next) => {
    try{
        var userId = req.user.id;
        var postId = req.query.postId;
        const post = await Post.findOne({where : {id : postId}});
        if(userId !== post.userId){
            await post.addScraper(parseInt(userId,10));
            return res.status(201).json({
                'message' : `Scrap Post`,
                'user' : user,
                'post' : post
            });
        }else{
            return res.status(403).json({
                'message' : `You Don't have authority`,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            'message' : 'User Scrap Post Error',
            'error' : error
        });
    }
});

router.delete('/scrap', isLoggedIn, async(req,res,next) => {
    try{
        var userId = req.user.id;
        var postId = req.query.postId;
        const post = await Post.findOne({where : {id : postId}});
        if(userId !== post.userId){
            await post.removeScraper(parseInt(userId,10));
            return res.status(204).json({
                'message' : `Post Scrap Delete`,
            });
        }else{
            return res.status(200).json({
                'message' : `You Don't have authority`,
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            'message' : 'User Scrap Post Delete Error',
            'error' : error
        });
    }
});

async function getHtml(url) {
    try {
      return await axios.get(url,{responseEncoding: 'binary'});
    } catch (error) {
      console.error(error);
    }
  }

router.post('/productUrl', isLoggedIn, async(req,res,next) =>{
    const productUrl = req.query.productUrl;
    var response = await getHtml(productUrl);
    const enc = charset(response.headers, response.data);
    var html = iconv.decode(response.data,enc);
    const $ = cheerio.load(html);
    const ogs={};
    var title = $("meta[property='og:title']").attr("content");
    if(title === undefined){
        title = $("html>head>title").text();
    }
    var description = $("meta[property='og:description']").attr("content");
    if(description === undefined){
        description = ($("meta[name='description']").attr("content"))? $("meta[name='desciption']").attr("content"): '';
    }
    var image = $("meta[property='og:image']").attr("content");
    if(image === undefined){
        image = $("html>body>img")[0].attr('src');
    }
    var url = $("meta[property='og:url']").attr("content");
    if(url === undefined){
        url =productUrl;
    }
    var site = $("meta[property='og:site_name']").attr("content");
    if(site === undefined){
        var parsedObject = Url.parse(productUrl);
        var urlRe = new RegExp('(.com)|(.co.kr)');
        site = parsedObject.hostname.replace('www.','').replace(urlRe,'');
    }
    var favicon = $("link[rel='shortcut icon']").attr("href");
    var faviconUrl = Url.parse(favicon);
    if(faviconUrl.protocol !=='https:' && faviconUrl.protocol !=='http:'){
        favicon = 'https:'+favicon;
    }
    ogs.title = title;
    ogs.description = description;
    ogs.image = image;
    ogs.url = url;
    ogs.site = site;
    ogs.favicon = favicon;
    res.status(200).json(ogs);
});
module.exports = router;