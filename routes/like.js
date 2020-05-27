const express = require('express');
const router = express.Router();
const sequelize = require('sequelize');

const { Post,User,Like } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.post('/', isLoggedIn, async(req, res, next) => {
    //localhost:8001/like?userId=e22a4f9c-a1cb-429c-9160-80508bc7c9f2&postId=1
    try{
        var userId = req.query.userId;
        var pageId = req.query.pageId;
        const user = await User.findOne({
            where : {
                id : userId
            }
        });
        user.addLike(parseInt(pageId,10));
        res.status(201).json({
            'message' : `${user.nickname} Like Post-${pageId}`,
        });
    } catch (error) {
        res.status(404).json({
            'message' : 'User Like Post Error',
            'error' : error
        });
        next(error);
    }
});

router.delete('/', isLoggedIn, async(req, res, next) => {
    try{
        var userId = req.query.userId;
        var pageId = req.query.pageId;
        const user = await User.findOne({
            where : {
                id : userId
            }
        });
        user.removeLike(parseInt(pageId,10));
        res.status(204).json({
            'message' : `${user.nickname} unLike Post-${pageId}`,
        });
    } catch (error) {
        res.status(404).json({
            'message' : 'User Like Post Error',
            'error' : error
        });
        next(error);
    }
});

module.exports = router;