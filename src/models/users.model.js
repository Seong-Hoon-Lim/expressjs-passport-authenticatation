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
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    //bcrypt compare (암호화 된 패스워드 비교)
    //plain password => client, this.password => DB 에 있는 비밀번호
    //Todo: 나중에 비밀번호 암호화 처리로 리팩토링 예정
    if (plainPassword === this.password) {
        cb(null, true);
    } else {
        cb(null, false);
    }
    return cb({ error: 'error' });
}

const User = mongoose.model('User', userSchema);

module.exports = User;