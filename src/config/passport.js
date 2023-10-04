const passport = require('passport');
const User = require('../models/users.model');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
require('dotenv').config()

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
const localStrategyConfig = new LocalStrategy({ usernameField: 'email', passwordField: 'password' },
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
);
passport.use('local', localStrategyConfig);

const googleStrategyConfig = new GoogleStrategy({
    clientID: process.env.GOOGLECLIENT_ID,
    clientSecret: process.env.GOOGLECLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['email', 'profile']
}, (accessToken, refreshToken, profile, done) => {
    console.log('google profile: ', profile);

    User.findOne({googleId: profile.id})
        .then(existingUser => {
            if (existingUser) {
                return existingUser;  // 기존 사용자 반환
            }

            const user = new User();
            user.email = profile.emails[0].value;
            user.googleId = profile.id;

            return user.save();  // 새로운 사용자 저장
        })
        .then(user => {
            done(null, user);  // 한 번만 done() 호출
        })
        .catch(err => {
            console.log(err);
            done(err);
        });
});
const kakaoStrategyConfig = new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: '/auth/kakao/callback'
}, (accessToken, refreshToken, profile, done) => {
    console.log('kakao profile: ', profile);

    User.findOne({kakaoId: profile.id})
        .then(existingUser => {
            if (existingUser) {
                return existingUser;  // 기존 사용자 반환
            }
            const user = new User();
            user.kakaoId = profile.id;
            user.email = profile._json.kakao_account.email;
            return user.save();  // 새로운 사용자 저장
        })
        .then(user => {
            done(null, user);  // 한 번만 done() 호출
        })
        .catch(err => {
            console.log(err);
            done(err);
        });
});
passport.use('google', googleStrategyConfig);
passport.use('kakao', kakaoStrategyConfig);

