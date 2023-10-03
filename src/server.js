const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/users.model');
const passport = require('passport');
const cookieSession = require('cookie-session');
const config = require('config');
require('dotenv').config()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//cookie session 이용
app.use(cookieSession({
    name: 'cookie-session',
    keys: [process.env.COOKIE_ENCRYPTION_KEY]
}))

// register regenerate & save after the cookieSession middleware initialization
app.use(function (request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb();
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb();
        }
    }
    next();
});

//passport 사용을 시작하고 cookie 를 사용해서 인증을 처리하게 설정
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
const {checkAuthenticated, checkNotAuthenticated} = require("./middlewares/auth");

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('mongodb connected');
    })
    .catch((err) => {
        console.log(err);
    })

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index');
})

app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup');
})
app.post('/signup', async (req, res) => {
    //user 객체 생성
    const user = new User(req.body);
    //user 컬렉션에 user 저장
    try {
        await user.save();
        return res.status(200).json({
            success: true
        })
    } catch (error) {
        console.error(error);
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login');
})

app.post('/login', (req, res, next) => {
    console.log('로그인을 시도')
    passport.authenticate("local", (err, user, info) => {
        console.log('일치하는 회원을 찾는 중')
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.json({ msg: info });
        }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    }) (req, res, next);
})

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}))

app.post('/logout', (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err) }
        res.redirect('/login');
    })
})

const serverConfig = config.get('server');
const port = serverConfig.port;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
