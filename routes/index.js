/*
 * GET home page.
 */
var twitter = require('twitter');
var util = require('util');
var debug = require('debug')('explorer');


var io = require('socket.io');

exports.index = function (http) {
    io = io(http);
    return function (req, res) {
        res.render('index', {title: 'Express'});
        if (req.session.oauth) {
            InitStream(req.session);
        }
    };
};

var isActive = false;
var InitStream = function (session) {
    var twit = new twitter({
        consumer_key: "A6x1nzmmmerCCmVN8zTgew",
        consumer_secret: "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
    });

    if (!isActive) {
        debug('init Stream');


        twit.stream(
            'statuses/filter.json',
            {track: "amor,odio,love,hate"}, //['amor', 'odio', 'love', 'hate']},
            function (stream) {
                stream.on('data', function (data) {
                    if (data.user) {
                        debug(data.user.screen_name + " : " + data.text);
                    } else {
                        debug(data);
                    }
                    io.sockets.emit('newTwitt', data);
                    // throw  new Exception('end');
                });
                stream.on('end', function (b) {
                    debug('end stream', arguments);
                    isActive = false;
                    InitStream(session);
                });
                stream.on('destroy', function (b) {
                    debug('destroy stream', b.toString());
                    isActive = false;
                    InitStream(session);
                });
            }
        );
        isActive = true;

    }
};
