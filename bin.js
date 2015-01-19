#!/usr/bin/env node
var fs = require('fs'),

    minimist = require('minimist'),

    package = require('./package'),
    song,

    thaletas;

var argv = minimist(process.argv.slice(2)),

    artist = argv._[0],
    help = argv.help || argv.h,
    out = argv.out || argv.o,
    sources = argv.sources || argv.s,
    title = argv._[1],
    version = argv.version || argv.v;

function showHelp() {
    console.log(package.description + '\n');

    console.log('Usage: thaletas "<artist>" "<title>" [options]\n');

    console.log(
        '-o, --out [<path>]\n\tOutput the MP3 file to specified path. If ' +
        'no -o is present,\n\tstream MP3 to stdout.\n\n' +

        '-s, --sources [<sources>]\n\tA comma-separated list of sources to' +
        'find the track.\n\tLeave empty to dump list of sources.\n\n' +

        '-h, --help\n\tOutput the help.\n\n' +
        '-v, --version\n\tOutput the version.'
    );
}

if (help) {
    return showHelp();
}

if (version) {
    return console.log(package.version);
}

if (sources === true) {
    return console.log(require('./').sources.join('\n'));
}

if (!artist || !title) {
    return showHelp();
}

if (typeof sources === 'string') {
    sources = sources ? sources.split(',') : undefined;
}

thaletas = require('./');

song = thaletas({
    artist: artist,
    title: title
}, sources);

if (!out) {
    return song.pipe(process.stdout);
}

if (out === true) {
    out = __dirname;
}

fs.stat(out, function (err, stats) {
    try {
        if (stats.isDirectory()) {
            out += '/' + artist + ' - ' + title + '.mp3';
        }
    } catch (e) { }

    song.pipe(fs.createWriteStream(out));
});
