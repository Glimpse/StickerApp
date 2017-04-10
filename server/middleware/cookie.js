module.exports = () => {
    return function sanitizeCookies(req, res, next) {
        res.clearCookie('searchTags');

        next();
    };
};
