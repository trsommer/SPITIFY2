const assert = require('assert');
const spotify = require('../spotify');

//this is a demo test - will be more usefull when the song code is ported from frontend to backend

describe('spotifySearch', function () {
    var spotifyArtistData;

    it('ID is the same', async function () {
        const lyricsResponse = await spotify.getSongLyrics('4W4fNrZYkobj539TOWsLO2', 'https://i.scdn.co/image/ab67616d0000b2738ad8f5243d6534e03b656c8b');
        console.log(lyricsResponse);
        assert.notEqual(lyricsResponse, null);
    });

});