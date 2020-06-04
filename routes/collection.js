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
                    Address,
                    MediaFile,
                    Description,{
                    model : Product,
                    as : 'Products'
                }]
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
            userId : req.user.id
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
        const postIds = Array.from(req.body.posts);
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
            postIds.map(async(postId) => {
                const post = await Post.findOne({
                    where : {
                        deletedAt : null,
                        id : postId,
                        dump : false
                    },
                    attributes : ['id']
                });
                await collection.addPost(post.id);
            });
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
        await collection.removeProduct(previousPost)
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



module.exports = router;