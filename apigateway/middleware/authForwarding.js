module.exports = () => {
    // This middleware forwards user information to subsequent services
    //
    // Note that existing Passport middleware doesn't handle this since Node
    // entities like req.user aren't preserved through inter-service HTTP forwarding.
    return function forwardAuth(req, res, next) {
        if (req && req.user && req.user.profile) {
            // If the user is authenticated, include their profile as a header
            // No services except this gateway will be publicly exposed, so there's it's
            // ok to communicate user information in clear text in a header.
            req.headers.stickerUser = JSON.stringify(req.user.profile);
        } else {
            // If a user is not authenticated, make sure no user information is included in the request
            // to prevent malicious users from including their own "profile"
            req.headers.stickerUser = "";
        }

        next();
    };
};
