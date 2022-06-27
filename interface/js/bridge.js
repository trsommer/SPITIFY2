async function getSpotifyArtist(id) {
    returnArray = await window.electronAPI.getArtistInfo(id)
    
    return returnArray["data"]["artist"]
}

async function getSpotifyAlbum(id) {
    returnArray = await window.electronAPI.getAlbumInfo(id)

    return returnArray
}

async function getSpotifySearchResults(query) {
    returnArray = await window.electronAPI.searchSpotify(query)

    return returnArray["data"]["search"]
}

async function getYoutubeUrls(query) {
    returnArray = await window.electronAPI.searchYoutube(query)

    return returnArray
}

async function getStreamingUrl(url) {
    result = await window.electronAPI.convertURL(url)

    console.log("convertion:");
    console.log(url);
    console.log(result);

    return result
}

async function updateStreamingUrl(id, url) {
    console.log('update')
    console.log(id)
    window.electronAPI.updateStreamingUrl(id, url)
}

async function sendNotification(title, body) {
    window.electronAPI.sendNotification(title, body)
}

async function getLevenshteinDistance(origin, comparison) {
    return window.electronAPI.getLevenshteinDistance(origin, comparison)
}

function insertSong(data) {
    window.electronAPI.insertSong(data)
}

async function getFromDB(query) {
    return window.electronAPI.getFromDB(query)
}

async function insertLastSearch(data) {
    window.electronAPI.insertLastSearch(data)
}

async function deleteLastSearch() {
    window.electronAPI.deleteLastSearch()
}

async function createPlaylistDB(data) {
    return window.electronAPI.createPlaylist(data)
}

async function likeSongDb(spotifyId, type) {
    window.electronAPI.likeSong(spotifyId, type)
}

async function getPlaylistSongs(playlistName) {
    return window.electronAPI.getPlaylistSongs(playlistName)
}

async function addPlaylistSong(spotifyId, playlistId) {
    window.electronAPI.addSongToPlaylist(spotifyId, playlistId)
}

async function removePlaylistSong(spotifyId, playlistId) {
    window.electronAPI.removeSongFromPlaylist(spotifyId, playlistId)
}

async function changePlaylistName(playlistId, name) {
    window.electronAPI.changePlaylistName(playlistId, name)
}