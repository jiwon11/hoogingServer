const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
    passport.use(new KakaoStrategy({
        clientID : process.env.KAKAO_ID,
        callbackURL : 'https://localhost:8001/auth/kakao/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        try {
            const exUser = await User.find({ where : {socialId : profile.id} });
            if (exUser) {
                done(null, exUser);
            } else {
                const newUser = await User.create({
                    email : profile._json && profile.json.kaccount_email,
                    nickname : profile.displayName,
                    socialId : profile.id
                });
                done(null, newUser);
            }
        } catch (error) {
            console.log(error);
            done(error);
        }
    }));
};