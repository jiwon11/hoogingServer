const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const { Tag,User,Post,Comment,MediaFile,Address,Description,Product, } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.get('/', isLoggedIn ,async (req,res, next) => {
    // /feed?offset=0&limit=20
    try {
        const offset = parseInt(req.query.offset,10); // 첫 10개 항목은 반환받지 않음.
        const limit = parseInt(req.query.limit,10); // 반환되는 항목의 개수 제한
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
                        }
                    },{
                        mainTagId: {
                            [Op.or]: followTagId
                        }
                    },{
                        subTagOneId: {
                          [Op.or]: followTagId
                        }
                    },{
                        subTagTwoId: {
                          [Op.or]: followTagId
                        }
                    }
                ],
                dump : false,
                deletedAt : null
            },
            order : [['createdAt', 'DESC']],
            include : [
                {
                    model : User,
                    attributes : ['id', 'nickname','profileImg'],
                    }, {
                        model : Tag,
                        as : 'mainTags',
                    }, {
                        model : Tag,
                        as : 'subTagOnes',
                    }, {
                        model : Tag,
                        as : 'subTagTwos',
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
                    },{
                        model : Comment,
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
                        ],
                        order : ['createdAt', 'DESC']
                    }
            ],
            offset : offset,
            limit : limit
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


module.exports = router;