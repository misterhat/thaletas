var allmuz = require('allmuz'),
    ffmpeg = require('fluent-ffmpeg'),
    grooveshark = require('grooveshark-streaming').Grooveshark.getStreamingUrl,
    hypem = require('hypem-stream'),
    mp3skull = require('mp3skull'),
    needle = require('needle'),
    tinysong = require('grooveshark-streaming').Tinysong.getSongInfo,
    youtube = require('youtube-search'),
    ytdl = require('ytdl-core');

var sources = {};

function firstDirect(search, terms, done) {
    search(terms.artist + ' ' + terms.title, function (err, tracks) {
        if (err) {
            return done(err);
        }

        try {
            direct = tracks[0].direct;
        } catch (e) {
            return done(new Error('No song found.'));
        }

        done(null, direct);
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

        video = ffmpeg(video).toFormat('mp3').pipe();

        done(null, video);
    });
};

sources.hypem = function (terms, done) {
    firstDirect(hypem.search, terms, done);
};

sources.allmuz = function (terms, done) {
    firstDirect(allmuz, terms, done);
};

sources.mp3skull = function (terms, done) {
    firstDirect(mp3skull, terms, done);
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

            done(null, mp3);
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

        grooveshark(song.SongID, done);
    });
};

module.exports = sources;
