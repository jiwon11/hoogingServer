const express = require('express');
const router = express.Router();

const { Post, Tag, User, MediaFile, Address, Comment, Like,Description,Product } = require('../models');
const { isLoggedIn } = require('./middlewares');


router.get('/', isLoggedIn, async(req,res) => {

});


module.exports = router;