const assert = require('assert');
const spotify = require('../spotify');

//this is a demo test - will be more usefull when the song code is ported from frontend to backend

describe('spotifySearch', function () {
    var spotifyArtistData;

    before(async function () {
        const apiResponse = await spotify.getArtistInfo("7dGJo4pcD2V6oG8kP0tJRR");
        spotifyArtistData = apiResponse.data.artist;
    });

    it('ID is the same', function () {
        const spotifyID = spotifyArtistData.id;
        assert.equal(spotifyID, "7dGJo4pcD2V6oG8kP0tJRR");
    });

});