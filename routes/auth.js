const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn,isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');
const gravatar = require('gravatar');

const router = express.Router();
router.post('/signUp', isNotLoggedIn, async(req, res, next) => {
    console.log(req.body);
    const {email, nickname, password, birthdate, gender  } = req.body;
    try {
        const exUser = await User.findOne({ where : { email } });
        if(exUser) {
            return res.status(200).json({
                'message' : 'You are already a member',
                'email' : exUser.email,
            });
        }
        const hash = await bcrypt.hash(password, 12);
        const userGravatar = gravatar.url(email,{s:'80',r:'x',d:'retro'},true);
        const birthDate = new Date(birthdate);
        const newUser = await User.create({
            email : email,
            nickname : nickname,
            password : hash,
            birthdate : birthDate,
            gender : gender,
            profileImg : userGravatar,
        });
        return res.status(200).json({
            'message' : 'signUp Complete!',
            'userInfo' : newUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            'error' : 'Find User Error',
            'message' : error
        });
    }
});

router.post('/login',isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.log(authError);
            return res.status(500).json({
                'error' : 'auth Error',
                'message' : authError
            });
        }
        if (!user) {
            return res.status(500).json({
                'error' : 'login Error',
                'message' : info.message
            });
        }
        req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return res.status(500) .json({
                    'error' : 'loginError',
                    'message' : loginError
                });
            }
            return res.status(201).json({
                'message' : 'Logged In',
                'user' : user
            });
        });
    }) (req, res, next);
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('kakao/callback', passport.authenticate('kakao', {
    failureRedirect : '/',
}), (req, res) => {
    res.redirect('/');
});

router.get('/logout',isLoggedIn, (req,res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});
module.exports = router;