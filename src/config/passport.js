const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;

//req.login(user) 로그인 시 1회  세션 생성
passport.serializeUser((user, done) => {
    done(null, user.id);
})
//client => session => request 클라이언트에서 세션을 요청
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
})
passport.use("local", new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
    (email, password, done) => {
        console.log('passport 미들웨어 진입');

        User.findOne({email: email.toLocaleLowerCase()})
            .then(user => {
                console.log('이메일을 찾는 중');
                if (!user) {
                    return done(null, false, { msg: `Email ${email} not found` });
                }

                // 패스워드 비교
                return user.comparePassword(password).then(isMatch => [isMatch, user]);
            })
            .then(([isMatch, user]) => {
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { msg: 'Invalid email or password' });
                }
            })
            .catch(err => {
                return done(err);
            });
    }
));