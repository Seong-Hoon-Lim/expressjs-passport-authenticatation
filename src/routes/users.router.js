const express = require('express');
const usersRouter = express.Router();
const User = require("../models/users.model");
const passport = require("passport");
const sendMail = require("../mail/mail");

usersRouter.post('/signup', async (req, res) => {
    //user 객체 생성
    const user = new User(req.body);
    //user 컬렉션에 user 저장
    try {
        await user.save();
        //이메일 발송
        sendMail('hooney200@knou.ac.kr', 'Seong Hoon Lim', 'welcome');
        return res.status(200).json({
            success: true
        })
    } catch (error) {
        console.error(error);
    }
});
usersRouter.post('/login', (req, res, next) => {
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
});
usersRouter.post('/logout', (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err) }
        res.redirect('/login');
    })
});
usersRouter.get('/google', passport.authenticate('google'));
usersRouter.get('/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = usersRouter;
