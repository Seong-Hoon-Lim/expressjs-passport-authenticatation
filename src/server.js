const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const User = require('./models/users.model');
const passport = require('passport');
const cookieSession = require('cookie-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const cookieEncryptionKey = 'superSecret-key';
//cookie session 이용
app.use(cookieSession({
    name: 'cookie-session',
    keys: [cookieEncryptionKey]
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

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

mongoose.connect(`mongodb+srv://hooney200:hooney1108@cluster0.155h4r3.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
        console.log('mongodb connected');
    })
    .catch((err) => {
        console.log(err);
    })

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
})
app.get('/login', (req, res) => {
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

app.get('/signup', (req, res) => {
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

const port = 4000;
app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
