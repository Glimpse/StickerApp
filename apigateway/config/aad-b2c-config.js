exports.creds = {

    // Required, tenant-specific endpoint such as: 'https://login.microsoftonline.com/<tenant_guid>/v2.0/.well-known/openid-configuration'
    identityMetadata: 'https://login.microsoftonline.com/StickerDemoB2CTenant.onmicrosoft.com/v2.0/.well-known/openid-configuration',
  
    // Required, the client ID of your app in AAD
    clientID: '2dacf161-cad4-45fe-9414-fb0c12f0e831',

    // Required, must be 'code', 'code id_token', 'id_token code' or 'id_token'
    // If you want to get access_token, you must be 'code', 'code id_token' or 'id_token code'
    // More info can be found here: https://docs.microsoft.com/en-us/azure/active-directory-b2c/active-directory-b2c-reference-tokens
    responseType: 'code id_token',

    // Required
    responseMode: 'form_post',

    // Required, the reply URL registered in AAD for your app
    redirectUrl: 'http://localhost:3000/users/auth/openid/return',

    // Required if we use http for redirectUrl
    allowHttpForRedirectUrl: true,
  
    // Required if `responseType` is 'code', 'id_token code' or 'code id_token'.
    // If app key contains '\', replace it with '\\'. Also found in AAD for your app.
    clientSecret: '<0C7Q{W27h2,-?7j',

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
    useCookieInsteadOfSession: false,

    // Required if `useCookieInsteadOfSession` is set to true. You can provide multiple set of key/iv pairs for key
    // rollover purpose. We always use the first set of key/iv pair to encrypt cookie, but we will try every set of
    // key/iv pair to decrypt cookie. Key can be any string of length 32, and iv can be any string of length 12.
    cookieEncryptionKeys: [
      { 'key': '12345678901234567890123456789012', 'iv': '123456789012' },
      { 'key': 'abcdefghijklmnopqrstuvwxyzabcdef', 'iv': 'abcdefghijkl' }
    ],

    // Optional. The additional scope you want besides 'openid'
    // (1) if you want refresh_token, use 'offline_access'
    // (2) if you want access_token, use the clientID
    scope: ['offline_access'],

    // Optional, 'error', 'warn' or 'info'
    loggingLevel: 'info',

    // Optional. The lifetime of nonce in session or cookie, the default value is 3600 (seconds).
    nonceLifetime: null,

    // Optional. The max amount of nonce saved in session or cookie, the default value is 10.
    nonceMaxAmount: 5,

    // Optional. The clock skew allowed in token validation, the default value is 300 seconds.
    clockSkew: null
};

// The url you need to go to destroy the session with AAD,
// replace <tenant_name> with your tenant name, and
// replace <signin_policy_name> with your signin policy name.
exports.destroySessionUrl =
  'https://login.microsoftonline.com/StickerDemoB2CTenant.onmicrosoft.com/oauth2/v2.0/logout' +
  '?p=B2C_1_SignIn' +
  '&post_logout_redirect_uri=http://localhost:3000';

