var util            = require('util'),
    path            = require('path'),
    express         = require('express'),
    logger          = require('morgan'),
    cookieParser    = require('cookie-parser'),
    bodyParser      = require('body-parser'),
    session         = require('express-session'),
    passport        = require('passport'),
    WrikeStrategy   = require('passport-wrike-oauth2').OAuth2Strategy;


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// API Access link for creating client ID and secret:
// https://developers.wrike.com/getting-started/
var WRIKE_CLIENT_ID     = '--insert-wrike-client-id-here--',
    WRIKE_CLIENT_SECRET = '--insert-wrike-client-secret-here--';

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


// Use the WrikeStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(
    new WrikeStrategy({
        clientID:       WRIKE_CLIENT_ID,
        clientSecret:   WRIKE_CLIENT_SECRET,
        callbackURL:    'http://localhost:3000/auth/wrike/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's Wrike profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Wrike account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }
));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'some-secret-session', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'public')));
app.use("/styles", express.static(__dirname + '/styles'));
app.get('/', function (req, res) {
    res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function (req, res){
    res.render('account', { user: req.user });
});

app.get('/login', function (req, res) {
    res.render('login', { user: req.user });
});


// GET /auth/wrike
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Wrike authentication will involve
//   redirecting the user to wrike.com.  After authorization, Wrike
//   will redirect the user back to this application at /auth/wrike/callback
app.get('/auth/wrike',
    passport.authenticate('wrike'),
    function (req, res){
        // The request will be redirected to Wrike for authentication, so this // function will not be called.
    }
);

// GET /auth/wrike/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/wrike/callback',
    passport.authenticate('wrike', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;

    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(3000);
console.log('Express server started on port 3000');