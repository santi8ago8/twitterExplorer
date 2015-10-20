/**
 * Module dependencies.
 */

var express = require('express');

var user = require('./routes/user');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var uid = require('uid');
var path = require('path');
var util = require('util');

var OAuth = require('oauth').OAuth;
var twitter = require('twitter');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
//app.use(express.favicon());
//app.use(express.logger('dev'));


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser('keyboard cat secret ;) :P hahaha marito dogsss'));
app.use(session({
    genid: function (req) {
        return uid(30); // use UUIDs for session IDs
    },
    resave: true,
    saveUninitialized: true,
    secret: 'keyboard cat secret ;)'
}));

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    //app.use(express.errorHandler());
}


//app.get('/users', user.list);

var server = require('http').Server(app);
console.log('Express server listening on port ' + app.get('port'));
server.listen(app.get('port'));
var routes = require('./routes');
app.get('/', routes.index(server));


var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "A6x1nzmmmerCCmVN8zTgew",
    "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
    "1.0A",
    "http://localhost:3000/auth/twitter/callback",
    "HMAC-SHA1"
);
app.get('/auth/twitter', function (req, res) {
    oa.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log(error);
            res.send("yeah no. didn't work.")
        } else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
        }
    });
});


app.get('/auth/twitter/callback', function (req, res, next) {
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;

        oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
            function (error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    console.log(error);
                    res.send("yeah something broke.");
                } else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    //console.log(results);
                    //console.log(req);

                    var twit = new twitter({
                        consumer_key: "A6x1nzmmmerCCmVN8zTgew",
                        consumer_secret: "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
                        access_token_key: req.session.oauth.access_token,
                        access_token_secret: req.session.oauth.access_token_secret
                    });

                    /*
                     .updateStatus('Test tweet from ntwitter/' + twitter.VERSION,
                     function (err, data) {
                     console.log(err, data ? data.toString() : "");*/
                    res.redirect('/');
                    /*}
                     );*/

                }
            }
        );
    } else
        next(new Error("you're not supposed to be here."))
});