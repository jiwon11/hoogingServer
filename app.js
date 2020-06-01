const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();

const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const searchRouter = require('./routes/search');
const userRouter = require('./routes/user');
const likeRouter = require('./routes/like');
const tagRouter = require('./routes/tag');
const commentRouter = require('./routes/comment');
const feedRouter = require('./routes/feed');
const openBankingRouter = require('./routes/openbanking');

const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync({});
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 3000);

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', homeRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/search', searchRouter);
app.use('/tag', tagRouter);
app.use('/like', likeRouter);
app.use('/user', userRouter);
app.use('/comment', commentRouter);
app.use('/feed', feedRouter);
app.use('/openBanking', openBankingRouter);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});