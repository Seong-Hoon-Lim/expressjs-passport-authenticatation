const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = mongoose.Schema({
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        minLength: 5
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    kakaoId: {
        type: String,
        unique: true,
        sparse: true
    },
})

const saltRounds = 10;
userSchema.pre('save', function (next) {
    let user = this;
    //비밀번호가 변경될 때만
    if (user.isModified('password')) {
        //salt 를 생성
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
})

/*
 mongoose 5버전 이후 콜백 함수 사용불가
 bcrypt compare (암호화 된 패스워드 비교)
 plain password => client, this.password => DB 에 있는 비밀번호
 */
userSchema.methods.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;