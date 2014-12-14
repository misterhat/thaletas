#!/usr/bin/env node
var fs = require('fs'),

    minimist = require('minimist'),
    thaletas = require('./'),

    package = require('./package');

var argv = minimist(process.argv.slice(2)),

    artist = argv._[0],
    title = argv._[1],

    // A list of comma separated spaces of the sources to use and which order.
    sources = argv.sources || argv.s,
    out = argv.out || argv.o,
    quiet = argv.quiet || argv.q;

function help() {
    console.log(package.name + ' - ' + package.version);
    console.log(package.description + '\n');

    console.log('Usage: thaletas "<artist>" "<title>" [options]\n');
    //console.log('\t
}

if (sources === true) {
    return console.log(Object.keys(thaletas.sources).join('\n'));
}

if (!artist || !title) {
    return help();
}

if (typeof sources === 'string') {
    sources = sources ? sources.split(',') : undefined;
}

if (!quiet) {
    console.error('searching for "' + artist + ' - ' + title + '"...');
}

thaletas({
    artist: artist,
    title: title
}, sources, function (err, song, source) {
    if (err) {
        return console.error(err);
    }

    if (!quiet) {
        console.error('found at ' + source + '!');
    }

    if (!out) {
        return song.pipe(process.stdout);
    }

    fs.stat(out, function (err, stats) {
        if (stats.isDirectory()) {
            out += '/' + artist + ' - ' + title + '.mp3';
        }

        song.pipe(fs.createWriteStream(out));
    });
});
