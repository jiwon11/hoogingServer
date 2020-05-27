var express = require('express');
const multer = require('multer');
const{ isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User,Post,Tag,Comment } = require('../models');

var router = express.Router();


const comment = multer();
router.post('/post', isLoggedIn, comment.none() ,async (req, res, next) => {
    //localhost:8001/comment/post?postId=1
    try{
        const userId = req.user.id;
        const postId = req.query.postId;
        await Comment.create({
            userId: userId,
            postId: postId,
            description : req.body.description,
          });
        res.status(201).json({
            'message' : 'Comment Post'
        });
    } catch(error){
        res.status(404).json({
            'message' : 'Comment Post Error',
            'error' : error
        });
        next(error);
    }
});

router.post('/like', isLoggedIn ,async (req, res, next) => {
    //localhost:8001/comment/like?commentId=1
    try{
        const commentId = req.query.commentId;
        await Comment.update({
            where : {
                id : commentId
            },
            Like : sequelize.literal('Like + 1'),
        });
        res.status(201).json({
            'message' : 'Comment Like'
        });
    } catch(error){
        res.status(404).json({
            'message' : 'Comment Like Error',
            'error' : error
        });
        next(error);
    }
});

router.post('/update', comment.none() ,async(req, res, next) => {
    //localhost:8001/comment/update?commentId=1
    try{
        const commentId = req.query.commentId;
        await Comment.update({
            where : {
                id : commentId
            },
            description : req.body.description
        });
        res.status(200).json({
            'message' : 'Comment Update'
        });
    } catch(error){
        res.status(404).json({
            'message' : 'Comment Update Error',
            'error' : error
        });
        next(error);
    }
});

router.delete('/delete', async(req, res, next) => {
    //localhost:8001/comment/delete?commentId=1
    try{
        const commentId = req.query.commentId;
        await Comment.destroy({
            where : {
                id : commentId
            },
        });
        res.status(204).json({
            'message' : 'Comment Delete'
        });
    } catch(error){
        res.status(404).json({
            'message' : 'Comment Delete Error',
            'error' : error
        });
        next(error);
    }
});
module.exports = router;