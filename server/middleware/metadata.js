module.exports = () => {
    return function metadataMiddleware(req, res, next) {
        res.setHeader('Server', 'Node v6.10.0');

        next();
    };
};
