const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn,isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');
const gravatar = require('gravatar');
const multer = require('multer');

const router = express.Router();
const auth = multer();

router.post('/signUp', auth.none(),async(req, res, next) => {
    const {email, nickname, password, birthdate, gender  } = req.body;
    try {
        const exUser = await User.findOne({ where : { email : email } , attributes :['email', 'provider']});
        if(exUser) {
            return res.status(200).json({
                'message' : 'You are already a member',
                'email' : exUser.email,
                'provider' : exUser.provider
            });
        }else {
            const hash = await bcrypt.hash(password, 12);
            const userGravatar = gravatar.url(email,{s:'80',r:'x',d:'mp'},true);
            const birthDate = new Date(birthdate);
            const newUser = await User.create({
                email : email,
                nickname : nickname,
                password : hash,
                birthdate : birthDate,
                gender : gender,
                profileImg : userGravatar,
            });
            return res.status(201).json({
                'message' : 'signUp Complete!',
                'userInfo' : newUser,
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            'error' : 'signUp Error',
            'message' : error
        });
    }
});

router.post('/login',isNotLoggedIn, auth.none(), (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
    try{
        if (authError) {
            console.log(authError);
            return res.status(401).json({
                'error' : 'auth Error',
                'message' : authError
            });
        }
        if (!user) {
            console.log(info.message);
            return res.status(404).json({
                'error' : 'login Error',
                'message' : info.message
            });
        }
        req.login(user, (loginError) => {
            if (loginError) {
                console.log(loginError);
                console.error(loginError);
                return res.status(400).json({
                    'error' : 'loginError',
                    'message' : loginError
                });
            }
            return res.status(200).json({
                'message' : 'Logged In',
                'user' : user
            });
        });
    }catch(error){
        console.log(error);
        return res.status(404).json({
            'error' : 'loginError',
            'message' : error
        });
    }
    }) (req, res, next);
});

router.post('/socialId',isNotLoggedIn, auth.none(), (req, res, next) => {
    passport.authenticate('socialId', (authError, user, info) => {
    try{
        if (authError) {
            console.log(authError);
            return res.status(401).json({
                'error' : 'auth Error',
                'message' : authError
            });
        }
        if (!user) {
            return res.status(404).json({
                'error' : 'login Error',
                'message' : info.message
            });
        }
        req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return res.status(400).json({
                    'error' : 'loginError',
                    'message' : loginError
                });
            }
            return res.status(200).json({
                'message' : 'Logged In',
                'user' : user
            });
        });
    }catch(error){
        console.log(error);
        return res.status(404).json({
            'error' : 'loginError',
            'message' : error
        });
    }
    }) (req, res, next);
});


/*
router.get('kakao/callback', passport.authenticate('kakao', {
    failureRedirect : '/',
}), (req, res) => {
    res.redirect('/');
});
*/

router.get('/logout',isLoggedIn, (req,res) => {
    req.logout();
    req.session.destroy();
    res.status(200).json({
        'message' : 'Logged out'
    });
});
module.exports = router;