const express = require('express');
const {isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, Tag, User, MediaFile, Address, Comment, Like,Description } = require('../models');
const request = require('request-promise-native');

const router = express.Router();

const authOptions = {
    method: 'GET',
    uri: "https://testapi.openbanking.or.kr/oauth/2.0/authorize",
    qs:{
        response_type:'code',
        client_id : 'VPu98oOnPUknUJintTCmy7UoOX3Bxplep04xw69Y',
        redirect_uri : 'http://localhost:8001/openBanking',
        scope : 'login inquiry transfer',
        state : '12345678901234567890123456789012',
        auth_type : '0'
    },
    headers: {
        "Accept": "application/json",
    },
    json: true
  };
router.get('/auth',isLoggedIn,async(req, res, next) => {
    request(authOptions)
    .then(function (parsedBody){
        res.json({
            'message' : 'Get Authorize complete',
            'result' : parsedBody
        }
            );
        }
    )
    .catch(function (err) {
        console.log(err);
        }
    );
});


router.get('/',async(req, res, next) => {
    const authInfo = req.query;
    console.log(authInfo);
    const tokenOptions = {
        method: 'POST',
        uri: "https://testapi.openbanking.or.kr/oauth/2.0/token",
        qs:{
            code : authInfo.code,
            client_id : 'VPu98oOnPUknUJintTCmy7UoOX3Bxplep04xw69Y',
            client_secret : 'LBvhL5smPcuXIbukuV7uYppMKHtj4rgnaxsmHAFC',
            redirect_uri : 'http://localhost:8001/openBanking',
            grant_type : 'authorization_code',
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        json: true
    };
    request(tokenOptions)
    .then(function (parsedBody){
        res.json({
            'message' : 'Get Token complete',
            'result' : parsedBody
        });
        }
    )
    .catch(function (err) {
        console.log(err);
        }
    );
});

router.get('/token',async(req, res, next) => {
    console.log(req.query);
    res.json(req.query);
});

module.exports = router;