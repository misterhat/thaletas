var needle = require('needle'),

    sources = require('./sources');

var DEFAULT_ORDER = [
    'grooveshark', 'music163', 'allmuz', 'hypem', 'youtube', 'mp3skull'
];

function findSong(terms, order, done) {
    var source, current;

    if (!done) {
        done = order;
        order = null;
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
        if (err) {
            if (order.length > 1) {
                return findSong(terms, order.slice(1), done);
            } else {
                return done(new Error('Unable to find any sources for track.'));
            }
        }

        if (typeof song === 'string') {
            song = needle.get(song);
        }

        done(null, song, current);
    });
}

module.exports = findSong;
module.exports.sources = sources;
