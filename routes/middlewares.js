exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({
            message : 'Required Login',
        }).end();
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        res.status(403).json({
            message : 'You are already logged in',
        }).end();
    }
};