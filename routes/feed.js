const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Tag,User,Post,Comment,MediaFile,Address,Description } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', isLoggedIn ,async (req,res, next) => {
    try {
        const user =  await User.findOne({
            where : {
                id : req.user.id
            },
            addributes : ['id','nickname','profileImg'],
            include : [
                {
                    model : User,
                    attributes : ['id'],
                    as : 'Followings',
                },
                {
                    model : Tag,
                    attributes : ['id'],
                },
            ],
            raws : true 
        });
        var followUserId = [];
        var followTagId = [] ;
        if(user.followings){
            followUserId = user.followings.map((following) => {return following.id;});
        }
        if(user.tags){
             followTagId = user.tags.map((tag) => {return tag.id;});
        }
        const feedPost = await Post.findAll({
            where : {
                [Op.or]: [
                    {
                        userId : {
                            [Op.or] : followUserId
                        },
                        tagId : {
                            [Op.or] : followTagId
                        },
                    }
                ],
                dump : false
            },
            order : [['createdAt', 'DESC']],
            include : [
                {
                    model : User,
                    attributes : ['id', 'nickname', 'profileImg']
                },{
                    model : Comment,
                    attributes : ['id', 'description', 'Like'],
                    include : [{
                        model : User,
                        attributes : ['id', 'nickname', 'profileImg']
                        }, {
                            model : Comment,
                            through : 'Reply',
                            as : 'replys',
                            include : [{
                                model : User,
                                attributes : ['id', 'nickname', 'profileImg']
                            }],
                            attributes : ['id', 'description', 'Like']
                        }
                    ]
                },{
                    model : MediaFile,
                    attributes : ['id','mimetype', 'filename', 'index'],
                },{
                    model : Address,
                    attributes : ['id', 'address', 'geographLong', 'geographLat'],
                },{
                    model : Tag,
                    attributes : ['id', 'name', 'starRate', 'reviewNum'],
                },{
                    model : Description,
                    attributes : ['id', 'description', 'index'],
                }
            ]
        });
        return res.status(200).json({
            'message' : 'Feed Load',
            'result' : feedPost
        });
    }catch (error) {
        console.log(error);
        return res.status(404).json({
          'message' : 'Feed Load Error',
          'error' : error
      });
    }
});
router.get('/testFeed', isLoggedIn, async (req,res, next) => {
    try{
        const post = Post.findAll({ include: { all: true}});
        return res.status(200).json(post);
    } catch(error){
        console.log(error);
        return res.status(404).json(error);
    }
});

module.exports = router;