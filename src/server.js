const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieSession = require('cookie-session');
const passport = require('passport');
const config = require('config');

const User = require('./models/users.model');

const serverConfig = config.get('server');
const port = serverConfig.port;

const mainRouter = require("./routes/main.router");
const usersRouter = require("./routes/users.router");

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
app.use('/', mainRouter);
app.use('/auth', usersRouter);

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
