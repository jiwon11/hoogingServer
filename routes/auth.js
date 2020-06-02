const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn,isNotLoggedIn } = require('./middlewares');
const { User,Verify } = require('../models');
const gravatar = require('gravatar');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mail = require('./mail');
const Sequelize = require('sequelize');

const router = express.Router();
const auth = multer();
const Op = Sequelize.Op;

router.post('/signUp', isNotLoggedIn ,auth.none(),async(req, res, next) => {
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
            res.status(201).json({
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

router.get('/emailVerify', isNotLoggedIn, async(req,res) => {
    const userEmail = req.query.email;
    const user = await User.findOne({
        where: {
          email: userEmail
        }
    });
    if(user){
        var key_one=crypto.randomBytes(10).toString('hex');
        var key_two=crypto.randomBytes(10).toString('base64');
        var key_for_verify=key_one+key_two;
        const data = { // 데이터 정리
            token : key_for_verify,
            userId: user.id,
          };
        await Verify.create(data);
        const emailParam = {
            token : key_for_verify,
            toEmail : user.email,
            req : req
        };
        mail.sendGmail(emailParam);
    }else{
        res.status(400).json({
            'message' : `You are not Member.`
        });
    }
    
});

router.get('/confirmEmail', isNotLoggedIn, async(req,res) => {
    const key = req.query.key;
    await Verify.findOne({
        where: {
          token: key,
          createdAt: {
            [Op.gt]: new Date(new Date() - 5 * 60 * 1000)
          }
        }
      }).then((Verify) => { // 유저데이터 호출
        res.status(200).json({
            'message' : 'Be certified!',
            'Verify' : Verify
        });
    });
});

router.post('/changePassword', auth.none(), async(req,res) => {
    const userEmail = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({
        where: {
          email: userEmail
        }
    });
    if(user){
        const hash = await bcrypt.hash(password, 12);
        await User.update({
            password : hash
        },{
            where: {id : user.id},
        });
        return res.status(201).json({
            'message' : 'Changed Password!'
        });
    }
});

router.get('/logout',isLoggedIn, (req,res) => {
    req.logout();
    req.session.destroy();
    res.status(200).json({
        'message' : 'Logged out'
    });
});
module.exports = router;