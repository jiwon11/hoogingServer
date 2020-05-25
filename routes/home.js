const express = require('express');
const {isLoggedIn, isNotLoggedIn } = require('./middlewares');
const router = express.Router();


router.get('/', (req, res, next) => {
  return res.status(200).json({
    message : 'hoogingApp Main Page'
  });
});

module.exports = router;