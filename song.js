const spotify = require("./spotify");
const youtube = require("./youtube");
const database = require("./dataBase");
const downloader = require("./downloader")
const songComparison = require("./songComparison");

module.exports = {
    generateSong,
    downloadSongs
}

async function generateSong(info) {
    const songParams = await getSongParameters(info);
    return songParams
}

function getAlbumId(info) {
    //check if info is string
    if (typeof info === "string") {
        return info
    }

    //check if "id" object is part of info
    if (info.hasOwnProperty("id")) {
        return info.id
    }

    //check if "uri" object is part of info
    if (info.hasOwnProperty("uri")) {
        return info.uri.split(":")[2]
    }

    throw new Error("Invalid input");
}

function getImageCoverUrl(album) {
    const coverArtArray = album.coverArt.sources;
    const bestCoverArt = coverArtArray.reduce((prev, curr) => {
        return prev.width > curr.width ? prev : curr;
    });
    return bestCoverArt.url;
}

async function getLikeStatus(info) {
    const likeStatus = await database.getSongLikeStatus(info.id);
    return likeStatus;
}

async function getSongFromDB(id) {
    const response = await database.getSong(id);
    return response;
}

async function getSongParameters(info) {
    const id = getAlbumId(info);
    const dbSongInfo = await getSongFromDB(id);

    if (dbSongInfo.length == 0) {
        const response = await spotify.addInfoArtistTracks([id]);
        info = response.data.tracks[0];

        const URLS = await getStreamingUrl(info);
        const album = info.album || info.albumOfTrack

        const songParameters = {
            songSpotifyId: id,
            songTitle: info.name,
            songArtistArray: info.artists.items,
            songType: "",
            songAlbum: JSON.stringify(album),
            songImageUrl: getImageCoverUrl(album),
            songDuration: info.duration.totalMilliseconds,
            songLyrics: "",
            songStreamingUrl: URLS.streamingURL,
            songLocalLocation: "",
            songYoutubeId: URLS.youtubeId,
            songLikeStatus: false,
            songPreferredVolume: 0.5,
            songInfo: info
        };

        await database.insertSong({id: id, songData: songParameters});
        //write to db

        return songParameters
    }

    //update streaming url if required
    
    const songParametersJSON = dbSongInfo[0].info;
    const songParameters = JSON.parse(songParametersJSON);

    const songStreamingUrl = songParameters.songStreamingUrl;

    if (songComparison.checkIfUrlExpired(songStreamingUrl)) {
        const youtubeUrl = "https://www.youtube.com/watch?v=" + songParameters.songYoutubeId;
        const streamingURL = await youtube.convertURL(youtubeUrl);
        songParameters.songStreamingUrl = streamingURL
        await database.updateSong({id: id, songData: songParameters});
    }

    //write back to db

    return songParameters;
}

async function getStreamingUrl(info) {
    const TITLE = info.name;
    const ARTISTS = info.artists.items;
    const ARTIST_STRING = ARTISTS.map(artist => artist.profile.name).join(", ");

    const SEARCH_QUERY = TITLE + " by " + ARTIST_STRING;

    const response = await youtube.searchYoutubeMusic(SEARCH_QUERY);

    const correctSong = await songComparison.chooseCorrectSong(response, info);

    const youtubeUrl = "https://www.youtube.com/watch?v=" + correctSong.youtubeId;

    const streamingURL = await youtube.convertURL(youtubeUrl)

    console.log(streamingURL);

    return {
        streamingURL: streamingURL,
        youtubeId: correctSong.youtubeId
    }
}

async function downloadSongs(songs, mainWindow) {
    const locations = downloader.downloadSongs(songs, mainWindow)
}
