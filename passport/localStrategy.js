const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models');

module.exports = (passport) => {
    passport.use('local',new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({ 
                where : { email: email },
                attributes : [
                    'id',
                    'password', 
                    'nickname',
                    'profileImg',
                    'hoogingAccountBalance',
                    'awsSnsEndpoint'
                ]
            });
            if (exUser) {
                const result = await bcrypt.compare(password, exUser.password);
                if (result) {
                    exUser.password = null;
                    done(null, exUser);
                } else {
                    done(null, false, { message : 'Not correct password.' });
                }
            } else {
                done(null, false, { message : 'You are not a member' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));

    passport.use('socicalId',new LocalStrategy({
        usersocialIdField : 'socialId',
    }, async (socialId, done) => {
        try {
            const exUser = await User.findOne({ 
                where : { socialId: socialId },
                attributes : [
                    'id',
                    'password', 
                    'nickname',
                    'profileImg',
                    'hoogingAccountBalance',
                    'awsSnsEndpoint'
                ]
            });
            if (exUser) {
                done(null, exUser);
            } else {
                done(null, false, { message : 'You are not a member' });
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};