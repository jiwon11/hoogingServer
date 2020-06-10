const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
//const google = require('./googleStrategy');
const { User } = require('../models');


module.exports = (passport) => {
    passport.serializeUser((user, done) => { 
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            console.log(id);
            const user = await User.findOne({
                where : { id : id },
            });
            return done(null, user);
        } catch (e) {
            console.log(e);
            console.error(e);
            return done(e);
        }
    });

    local(passport);
    //google(passport);
};
