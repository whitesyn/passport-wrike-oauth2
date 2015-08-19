# Passport-Wrike-OAuth2

[Passport](http://passportjs.org/) strategies for authenticating with [Wrike](https://www.wrike.com/) using OAuth 2.0.

This module lets you authenticate using Wrike in your Node.js applications.
By plugging into Passport, Wrike authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

The client id and client secret needed to authenticate with Wrike can be set up from this page: [Get started with the Wrike API](https://developers.wrike.com/getting-started/).

## Install

    $ npm install passport-wrike-oauth2

## Usage of OAuth 2.0

#### Configure Strategy

The Wrike OAuth 2.0 authentication strategy authenticates users using a Wrike
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a client ID, client secret, and callback URL.

```Javascript
var WrikeStrategy = require('passport-wrike-oauth2').OAuth2Strategy;

passport.use(new WrikeStrategy({
    clientID: WRIKE_CLIENT_ID,
    clientSecret: WRIKE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/wrike/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ wrikeId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'wrike'` strategy, to authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/) application:

```Javascript
app.get('/auth/wrike', passport.authenticate('wrike'));

app.get('/auth/wrike/callback', 
  passport.authenticate('wrike', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

## Examples

For a complete, working example, refer to the [example](https://github.com/whitesyn/passport-wrike-oauth2/tree/master/examples/).

## Tests

    $ npm install --dev
    $ make test

[![Build Status](https://secure.travis-ci.org/whitesyn/passport-wrike-oauth2.png)](http://travis-ci.org/whitesyn/passport-wrike-oauth2)

## Credits

  - [Victor Kuznetsov](https://github.com/whitesyn)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Victor Kuznetsov <[https://github.com/whitesyn/](https://github.com/whitesyn/)>