const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');

const { Post,User,Like } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.post('/', isLoggedIn, async(req, res, next) => {
    //localhost:8001/like?userId=e22a4f9c-a1cb-429c-9160-80508bc7c9f2&postId=1
    try{
        var userId = req.query.userId;
        var postId = req.query.postId;
        const user = await User.findOne({where : {id : userId}, attributes : ['id','nickname','profileImg']});
        const post = await Post.findOne({where : {id : postId}});
        await post.addLiker(user.id);
        return res.status(201).json({
            'message' : `Like Post`,
            'user' : user,
            'post' : post
        });
    } catch (error) {
        console.log(error);
        return res.status(404).json({
            'message' : 'User Like Post Error',
            'error' : error
        });
    }
});

router.delete('/', isLoggedIn, async(req, res, next) => {
    try{
        var userId = req.query.userId;
        var postId = req.query.postId;
        const user = await User.findOne({where : {id : userId}, attributes : ['id','nickname','profileImg']});
        const post = await Post.findOne({where : {id : postId}});
        await post.removeLiker(parseInt(user.id,10));
        return res.status(201).json({
            'message' : `Delete Like Post`,
            'user' : user,
            'post' : post
        });
    } catch (error) {
        return res.status(404).json({
            'message' : 'User Like Post Error',
            'error' : error
        });
    }
});

module.exports = router;