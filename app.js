/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.session({ secret: "very secret" }));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var OAuth = require('OAuth');
var util = require('util');
/*
 var oauth = new OAuth.OAuth(
 'https://api.twitter.com/oauth/request_token',
 'https://api.twitter.com/oauth/access_token',
 'A6x1nzmmmerCCmVN8zTgew',
 'oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw',
 '1.0A',
 null,
 'HMAC-SHA1'
 );
 oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
 if(error) util.puts('error :' + error)
 else {
 util.puts('oauth_token :' + oauth_token)
 util.puts('oauth_token_secret :' + oauth_token_secret)
 util.puts('requestoken results :' + util.inspect(results))
 util.puts("Requesting access token")
 oauth.getOAuthAccessToken(oauth_token, oauth_token_secret, function(error, oauth_access_token, oauth_access_token_secret, results2) {
 util.puts('oauth_access_token :' + oauth_access_token)
 util.puts('oauth_token_secret :' + oauth_access_token_secret)
 util.puts('accesstoken results :' + util.inspect(results2))
 util.puts("Requesting access token")
 var data= "";
 oauth.getProtectedResource("http://term.ie/oauth/example/echo_api.php?foo=bar&too=roo", "GET", oauth_access_token, oauth_access_token_secret,  function (error, data, response) {
 util.puts(data);
 });
 });
 }
 });
 */
/*
app.get('/login', function (a, b) {
    var oa = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        'A6x1nzmmmerCCmVN8zTgew',
        'oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw',
        '1.0A',
        'http://localhost:3000/cb',
        'HMAC-SHA1'
    );
    oa.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log('error');
            console.log(error);
        }
        else {
            // store the tokens in the session
            a.session.oa = oa;
            a.session.oauth_token = oauth_token;
            a.session.oauth_token_secret = oauth_token_secret;

            // redirect the user to authorize the token
            b.redirect("https://api.twitter.com/oauth/request_token?oauth_token=" + oauth_token);
        }
    })


});*/
/*
var OAuth2 = OAuth.OAuth2;
var twitterConsumerKey = 'A6x1nzmmmerCCmVN8zTgew';
var twitterConsumerSecret = 'oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw';
var oauth2 = new OAuth2(
    twitterConsumerKey,
    twitterConsumerSecret,
    'https://api.twitter.com/',
    null,
    'oauth2/token',
    null);
oauth2.getOAuthAccessToken(
    '',
    {'grant_type':'client_credentials'},
    function (e, access_token, refresh_token, results){
        console.log('bearer: ',access_token);
        oauth2.get('protected url',
            access_token, function(e,data,res) {
                if (e) return callback(e, null);
                if (res.statusCode!=200)
                    return callback(new Error(
                        'OAuth2 request failed: '+
                            res.statusCode),null);
                try {
                    data = JSON.parse(data);
                }
                catch (e){
                    return callback(e, null);
                }
                return callback(e, data);
            });
    });
function callback(a,b){
    console.log(a,b);
}
app.get('/cb', function (a, b) {

console.log(a);
    a.session.oauth_token_2 = a.query.oauth_token;
    a.session.oauth_token_secret_2 = a.query.oauth_verifier;
    b.redirect('/')
});
*/

var OAuth= require('oauth').OAuth;

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "A6x1nzmmmerCCmVN8zTgew",
    "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
    "1.0",
    "http://localhost:3000/auth/twitter/callback",
    "HMAC-SHA1"
);
app.get('/auth/twitter', function(req, res){
    oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if (error) {
            console.log(error);
            res.send("yeah no. didn't work.")
        }
        else {
            req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            console.log('oauth.token: ' + req.session.oauth.token);
            req.session.oauth.token_secret = oauth_token_secret;
            console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
        }
    });
});

var twitter = require('ntwitter');
app.get('/auth/twitter/callback', function(req, res, next){
    if (req.session.oauth) {
        req.session.oauth.verifier = req.query.oauth_verifier;
        var oauth = req.session.oauth;

        oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
            function(error, oauth_access_token, oauth_access_token_secret, results){
                if (error){
                    console.log(error);
                    res.send("yeah something broke.");
                } else {
                    req.session.oauth.access_token = oauth_access_token;
                    req.session.oauth.access_token_secret = oauth_access_token_secret;
                    console.log(results);
                    //console.log(req);
                    var twit = new twitter({
                        consumer_key: "A6x1nzmmmerCCmVN8zTgew",
                        consumer_secret: "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
                        access_token_key: req.session.oauth.access_token,
                        access_token_secret: req.session.oauth.access_token_secret
                    });


                    twit
                        .verifyCredentials(function (err, data) {
                            console.log(err,data);
                        })
                        .updateStatus('Test tweet from ntwitter/' + twitter.VERSION,
                        function (err, data) {
                            console.log(err,data);
                            res.redirect('/');
                        }
                    );

                }
            }
        );
    } else
        next(new Error("you're not supposed to be here."))
});