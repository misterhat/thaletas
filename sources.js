var allmuz = require('allmuz'),
    ffmpeg = require('fluent-ffmpeg'),
    grooveshark = require('grooveshark-streaming').Grooveshark.getStreamingUrl,
    mp3monkey = require('mp3monkey'),
    mp3skull = require('mp3skull'),
    mp3zap = require('mp3zap'),
    needle = require('needle'),
    tinysong = require('grooveshark-streaming').Tinysong.getSongInfo,
    youtube = require('youtube-search'),
    ytdl = require('ytdl-core');

var sources = {};

function firstDirect(search, terms, done) {
    search(terms.artist + ' ' + terms.title, function (err, tracks) {
        var track;

        if (err) {
            return done(err);
        }

        try {
            track = tracks[0]
        } catch (e) {
            return done(new Error('No song found.'));
        }

        if (!track) {
            return done();
        }

        if (track.song) {
            return done(null, track.song);
        } else if (track.direct) {
            return done(null, needle.get(track.direct));
        }

        done();
    });
}

sources.youtube = function (terms, done) {
    youtube(terms.artist + ' ' + terms.title, {
        maxResults: 1,
        startIndex: 1
    }, function (err, video) {
        if (err) {
            return done(err);
        }

        try {
            video = video[0].url;
        } catch (e) {
            return done(new Error('No song found.'));
        }

        video = ytdl(video, {
            filter: function (format) {
                return format.container === 'mp4';
            }
        });

        video = ffmpeg(video).format('mp3').pipe();

        done(null, video);
    });
};

sources.allmuz = function (terms, done) {
    firstDirect(allmuz, terms, done);
};

sources.mp3skull = function (terms, done) {
    firstDirect(mp3skull, terms, done);
};

sources.mp3zap = function (terms, done) {
    firstDirect(mp3zap, terms, done);
};

sources.mp3monkey = function (terms, done) {
    firstDirect(mp3monkey, terms, done);
};

sources.music163 = function (terms, done) {
    var headers = {
        'User-Agent':
            'Mozilla/5.0 (X11; Linux i686; rv:31.0) Gecko/20100101 ' +
            'Firefox/31.0',
        Referer: 'http://music.163.com'
    };

    needle.post('http://music.163.com/api/search/suggest/web?csrf_token=', {
        limit: 1,
        s: terms.artist + ' ' + terms.title
    }, { headers: headers }, function (err, res, body) {
        var song;

        if (err) {
            return done(err);
        }

        try {
            body = JSON.parse(body);
            song = body.result.songs[0].id;
        } catch (e) {
            return done(new Error('No songs found.'));
        }

        needle.request('get', 'http://music.163.com/api/song/detail', {
            id: song,
            ids: '[' + song + ']',
            csrf_token: '',
        }, { headers: headers }, function (err, res, body) {
            var mp3;

            if (err) {
                return done(err);
            }

            try {
                body = JSON.parse(body);
                mp3 = body.songs[0].mp3Url;
            } catch (e) {
                return done(new Error('No MP3 link found.'));
            }

            done(null, needle.get(mp3, { headers: headers }));
        });
    });
};

sources.grooveshark = function (terms, done) {
    tinysong(terms.title, terms.artist, function (err, song) {
        if (err) {
            return done(err);
        }

        if (!song) {
            return done(new Error('No song found.'));
        }

        grooveshark(song.SongID, function (err, url) {
            if (err) {
                return done(err);
            }

            done(null, needle.get(url));
        });
    });
};

module.exports = sources;
