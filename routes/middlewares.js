exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        return res.status(403).json({
            message : 'Required Login',
        });
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        return res.status(403).json({
            message : 'You are already logged in',
        });
    }
};