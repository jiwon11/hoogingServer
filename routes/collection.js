const express = require('express');
const { isLoggedIn,isNotLoggedIn } = require('./middlewares');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product,Collection } = require('../models');
const multer = require('multer');

const router = express.Router();
const collection = multer();

router.get('/', isLoggedIn ,async(req, res) =>{
    const collectionId = req.query.collectionId;
    try{
        const collection = await Collection.findOne({
            where : {
                id : collectionId
            },
            include : [{
                model : Post,
                as : 'Posts',
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
                        }
                    ]
            }]
        });
        return res.status(200).json({
            'message' : 'Get Collection',
            'collection' : collection
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Collection Found',
            'error' : error
        });
    }
});

router.post('/create', isLoggedIn, collection.none() ,async(req, res) =>{
    try{
        const name = req.body.name;
        await Collection.create({
            name : name,
            userId : req.user.id,
            open : req.body.open
        });
        return res.status(201).json({
            'message' : 'Create Collection!'
        });
    } catch(error){
        res.status(404).json({
            'message' : 'Collection Create Error',
            'error' : error
        });
    }
});

router.post('/postAdd', isLoggedIn, collection.none(), async(req, res) => {
    try{
        const postIds = req.body.posts.split(',');
        const collectionId = req.body.collectionId;
        const userId = req.user.id;
        const collection = await Collection.findOne({
            where : {
                deletedAt : null,
                id : collectionId,
                userId : userId
            }
        });
        if(collection){
            for(const postId of postIds){
                await Post.findOne({where : {id:postId}}).then(post =>{
                    console.log(post);
                    collection.addPost(post.id);
                });
            }
            return res.status(201).json({
                'message' : 'Posts Add In Collection',
                'collection' : collection
            });
        }else {
            return res.status(404).json({
                'message' : `Can't find Collection`,
                'collection' : collection
            });
        }
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Posts Add In Collection Error',
            'error' : error
        });
    }
});

router.post('/postUpdate', isLoggedIn, collection.none(), async(req, res) => {
    try{
        const postIds = Array.from(req.body.posts);
        const collectionId = req.body.collectionId;
        const userId = req.user.id;
        const collection = await Collection.findOne({
            where : {
                deletedAt : null,
                id : collectionId,
                userId : userId
            },
            include : [{
                model : Post,
                as : 'Posts',
                attributes : ['id']
                }
            ]
        });
        const previousPost = collection.posts.map((post) => {return post.id;});
        console.log(previousPost);
        await collection.removePost(previousPost)
        .then(async() => {
            postIds.map(async(postId) => {
                const post = await Post.findOne({
                    where : {
                        id : postId
                    },
                    attributes : ['id']
                });
                await collection.addPost(post.id);
            });
            return res.status(201).json({
                'message' : 'Posts Update In Collection',
                'collection' : collection
            });
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Posts Add In Collection Error',
            'error' : error
        });
    }
});

router.delete('/delete', isLoggedIn, collection.none() ,async(req, res) =>{
    try{
        const collectionId = req.body.collectionId;
        await Collection.destroy({
            where : {
                id : collectionId
            }
        });
        return res.status(204).json({
            'message' : 'Collection Delete'
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Collection Delete Error',
            'error' : error
        });
    }
});

router.post('/like', isLoggedIn, async(req, res) => {
    try{
        const collectionId = req.query.collectionId;
        await Collection.increment('Like',{where : {id : collectionId }});
        return res.status(201).json({
            'message' : 'Collection Like Post',
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Collection Like Post Error',
            'error' : error
        });
    }
});

router.delete('/like', isLoggedIn, async(req, res) => {
    try{
        const collectionId = req.query.collectionId;
        await Collection.decrement('Like',{where : {id : collectionId }});
        return res.status(201).json({
            'message' : 'Collection Like Delete',
        });
    } catch(error){
        console.log(error);
        res.status(404).json({
            'message' : 'Collection Like Delete Error',
            'error' : error
        });
    }
});


module.exports = router;