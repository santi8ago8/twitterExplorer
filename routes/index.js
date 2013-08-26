/*
 * GET home page.
 */
var twitter = require('ntwitter');
var io = require('socket.io').listen(3001, {log: false});
exports.index = function (req, res) {
    res.render('index', { title: 'Express' });
    if (req.session.oauth) {
        var twit = new twitter({
            consumer_key: "A6x1nzmmmerCCmVN8zTgew",
            consumer_secret: "oOMuBkeqXLqoJkSklhpTrsvuZXo9VowyABS8EkAUw",
            access_token_key: req.session.oauth.access_token,
            access_token_secret: req.session.oauth.access_token_secret
        });


        twit
            .verifyCredentials(function (err, data) {
                console.log(err, data);
            })
            .updateStatus('Test tweet from ntwitter/' + twitter.VERSION,
            function (err, data) {
                console.log(data);
            }
        );


        twit.stream(
            'statuses/filter',
            {track: ['amor', 'odio', 'love', 'hate']},
            function (stream) {
                stream.on('data', function (data) {
                    //console.log(data);
                    //console.log(data.user.screen_name + " : " + data.text);
                    io.sockets.emit('newTwitt', data);
                    // throw  new Exception('end');
                });
            }
        );
    }
};

