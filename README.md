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

    $ thaletas "the beatles" "happiness is a warm gun" > out.mp3

Find a track, save it and stream it as it downloads:

    $ thaletas "modest mouse" dramamine | tee dramamine.mp3 | mpv -

Download the MP3 track from a specific source order (list them with empty -s):

    $ thaletas "ty segall" "it's over" -s grooveshark,allmuz -o out.mp3

### API
```javascript
var fs = require('fs'),
    thaletas = require('thaletas');

thaletas({
    artist: 'chad vangaalen',
    title: 'evil'
}).pipe(fs.createWriteStream('bag.mp3'));
```

## API
### thaletas.sources
An array of each source supported (as strings).

```javascript
[
    'mp3monkey', 'allmuz', 'mp3zap', 'music163', 'mp3skull', 'grooveshark',
    'youtube'
]
```

### thaletas(terms, [order])
Find an MP3 stream based on artist/title.

`terms` is an object which should contain a `title` and `artist` string. `track`
is an alias for `title`.

`order` is an optional array of strings to specify which order to look for the
track in. `order` can be a string it there's only one source.

## License
MIT
