exports.creds = {

    // Required, tenant-specific endpoint such as: 'https://login.microsoftonline.com/<tenant_guid>/v2.0/.well-known/openid-configuration'
    identityMetadata: `https://login.microsoftonline.com/${process.env.AD_TENANT}/v2.0/.well-known/openid-configuration`,

    // Required, the client ID of your app in AAD
    clientID: process.env.AD_CLIENT_ID,

    // Required, must be 'code', 'code id_token', 'id_token code' or 'id_token'
    // If you want to get access_token, you must be 'code', 'code id_token' or 'id_token code'
    // More info can be found here: https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-reference-tokens
    responseType: 'code id_token',

    // Required - set to either form_post or query; form_post is recommended.  TODO: Follow up on this (this setting
    // controls whether POST\GET is issued for authentication callback).
    responseMode: 'form_post',

    // Required, the reply URL registered in AAD for your app
    redirectUrl: process.env.AD_REDIRECT_URL,

    // Required if we use http for redirectUrl
    allowHttpForRedirectUrl: true,

    // Required if `responseType` is 'code', 'id_token code' or 'code id_token'.
    // If app key contains '\', replace it with '\\'. Also found in AAD for your app.
    clientSecret: process.env.AD_CLIENT_SECRET,

    // Required, must be true for B2C
    isB2C: true,

    // Required to set to false if you don't want to validate issuer
    validateIssuer: true,

    // Required if you want to provide the issuer(s) you want to validate instead of using the issuer from metadata
    issuer: null,

    // Required to set to true if the `verify` function has 'req' as the first parameter
    passReqToCallback: false,

    // Recommended to set to true. By default we save state in express session, if this option is set to true, then
    // we encrypt state and save it in cookie instead. This option together with { session: false } allows your app
    // to be completely express session free.
    useCookieInsteadOfSession: false
};

// The url you need to go to destroy the session with AAD
exports.destroySessionUrl = process.env.AD_DESTROY_SESSION_URL;
