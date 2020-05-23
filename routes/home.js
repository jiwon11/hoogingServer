const express = require('express');
const {isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();


router.get('/', (req, res, next) => {
  return res.json({
    code : 200,
    message : 'hoogingApp Main Page'
  });
});

module.exports = router;