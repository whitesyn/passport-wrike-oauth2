/**
 * Module dependencies.
 */
var util                = require('util'),
    OAuth2Strategy      = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError  = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Wrike authentication strategy authenticates requests by delegating to
 * Wrike using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Wrike application's client id
 *   - `clientSecret`  your Wrike application's client secret
 *   - `callbackURL`   URL to which Wrike will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(
 *         new WrikeStrategy({
 *             clientID:        'qwerty',
 *             clientSecret:    'shhh-its-a-secret'
 *             callbackURL:     'https://www.example.net/auth/wrike/callback'
 *         },
 *         function(accessToken, refreshToken, profile, done) {
 *             User.findOrCreate({wrikeId: profile.id}, function (err, user) {
 *                 done(err, user);
 *             });
 *         })
 *     );
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
    options = options || {};
    options.authorizationURL = options.authorizationURL || 'https://www.wrike.com/oauth2/authorize';
    options.tokenURL = options.tokenURL || 'https://www.wrike.com/oauth2/token';

    OAuth2Strategy.call(this, options, verify);
    this.name = 'wrike';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Wrike.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `wrike`
 *   - `id`
 *   - `username`
 *   - `name`
 *   - `displayName`
 *   - `emails`
 *   - `profiles`
 *   - `metadata`
 *   - `locale`
 *   - `timezone`
 *   - `photos`
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
    this._oauth2.get('https://www.wrike.com/api/v3/contacts?me=true', accessToken, function (err, body, res) {
        if (err) {
            return done(new InternalOAuthError('failed to fetch user profile', err));
        }

        try {
            var json    = JSON.parse(body),
                contact = body.data && Array.isArray(body.data.data) ? body.data.data[0] : null;

            if (!contact) {
                return done(new InternalOAuthError('No user profile in response', body));
            }

            var profile = {
                provider:       'wrike',
                id:             contact.id,
                displayName:    contact.firstName + ' ' + contact.lastName,
                username:       contact.firstName + ' ' + contact.lastName,
                name:           contact.firstName + ' ' + contact.lastName,
                emails:         contact.profiles.map(function (profile) { return {value: profile.email} }),
                profiles:       contact.profiles,
                metadata:       contact.metadata,
                locale:         contact.locale,
                timezone:       contact.timezone,
                photos:         [ {value: contact.avatarUrl} ]
            };

            profile._raw    = body;
            profile._json   = json;

            done(null, profile);
        } catch(e) {
            done(e);
        }
    });
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;