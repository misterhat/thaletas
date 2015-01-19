var stream = require('stream'),

    needle = require('needle'),

    sources = require('./sources');

var DEFAULT_ORDER = [
    'mp3monkey', 'allmuz', 'mp3zap', 'music163', 'mp3skull', 'grooveshark',
    'youtube'
];

function findSong(terms, order, done) {
    var source, current;

    if (terms.track && !terms.title) {
        terms.title = terms.track;
    }

    if (!order || !order.length) {
        order = DEFAULT_ORDER;
    }

    if (typeof order === 'string') {
        order = [ order ];
    }

    current = order[0];

    if (!sources.hasOwnProperty(current)) {
        return done(new Error(
            'Invalid source in order, "' + current + '".'
        ));
    }

    if (!terms.artist || !terms.title) {
        return done(new Error('Missing artist or title from terms.'));
    }

    sources[current](terms, function (err, song) {
        if (err || !song) {
            if (order.length > 1) {
                return findSong(terms, order.slice(1), done);
            } else {
                return done(new Error('Unable to find any sources for track.'));
            }
        }

        done(null, song);
    });
}

function getSong(terms, order) {
    var song = new stream.PassThrough();

    findSong(terms, order, function (err, stream) {
        if (err) {
            return process.nextTick(function () {
                song.emit('error', err);
            });
        }

        stream.pipe(song);
    });

    return song;
}

module.exports = getSong;
module.exports.sources = DEFAULT_ORDER;
