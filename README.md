# thaletas
Stream and download MP3 tracks from various online sources. Thaletas supports
programmatic usage as well as the CLI.

## Installation
For the CLI program:

    # npm install -g thaletas

For the module:

    $ npm install thaletas

## Examples
### CLI
Find a track and save it to `out.mp3`:

    $ thaletas "the beatles" "happiness is a warm gun" -o out.mp3

Find a track, display the speed with pv and stream it to mplayer:

    $ thaletas "modest mouse" "dramamine" | pv | mplayer -quiet -

Download the MP3 track from a specific source order (list them with empty -s):

    $ thaletas "ty segall" "it's over" --sources grooveshark,allmuz -o out.mp3

### API
```javascript
var fs = require('fs'),
    thaletas = require('thaletas');

thaletas({
    artist: 'the beatles',
    title: 'all my loving'
}, function (err, track) {
    if (!err && track) {
        track.pipe(fs.createWriteStream('out.mp3'));
    }
});
```

## API
### thaletas.sources
An object containaing each ripping method.

` { youtube: function (terms, done) } `

### thaletas(terms, [order], done)
Find a track based on artist/title.

`terms` is an object which should contain a `title` and `artist` string.

`order` is an optional array of strings to specify which order to look for the
track in.

## License
MIT
