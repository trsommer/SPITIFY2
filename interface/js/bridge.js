async function getSpotifyArtist(id) {
    returnArray = await window.electronAPI.getArtistInfo(id)
    
    return returnArray["data"]["artist"]
}

async function getSpotifyAlbum(id) {
    returnArray = await window.electronAPI.getAlbumInfo(id)

    return returnArray
}

async function getAlbumMetadata(id) {
    data = await window.electronAPI.getAlbumMetadata(id)

    return data.data.albumUnion
}

async function getSongInfo(ids) {
    return window.electronAPI.getSongInfo(ids)
}

async function getSpotifySearchResultsNoArgs(query) {
    window.electronAPI.searchSpotify(query)
}

async function getSpotifySearchResults(query, type, limit, offset) {
    window.electronAPI.searchSpotifySpecificType(query, type, limit, offset)
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

async function updateSong(data) {
    window.electronAPI.updateSong(data)
}

async function sendNotification(data) {
    window.electronAPI.sendNotification(data)
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

async function deleteSpecificLastSearch(id) {
    window.electronAPI.deleteSpecificLastSearch(id)
}

async function createPlaylistDB(data) {
    return window.electronAPI.createPlaylist(data)
}

async function likeSongDb(spotifyId, type) {
    console.log('like');
    window.electronAPI.likeSong(spotifyId, type)
}

async function getPlaylistSongs(playlistId) {
    playlistName = 'playlist' + playlistId;
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

async function changePlaylistImage(playlistId, url) {
    window.electronAPI.changeImageCover(playlistId, url)
}

async function updatePlaylist(playlistId, songData) {
    window.electronAPI.updatePlaylist(playlistId, songData)
}

async function downloadSongs(songs) {
    return window.electronAPI.downloadSongs(songs)
}

async function addDownloadedSong(songId) {
    window.electronAPI.addDownloadedSong(songId)
}

async function removeDownloadedSong(songId) {
    window.electronAPI.removeDownloadedSong(songId)
}

async function getDownloadedSongs() {
    return window.electronAPI.getDownloadedSongs()
}

async function addLastSearch(type, name, spotifyId, imageUrl, additionalInfo) {
    var lastSearches = await getLastSearches()
    var lastSearchesLength = Object.keys(lastSearches).length

    deleteSpecificLastSearch(spotifyId);

    if (lastSearchesLength == 16) {
        found = false

        for (let index = 0; index < lastSearches.length; index++) {
            const lastSearch = lastSearches[index];
            if (lastSearch.spotifyId == spotifyId) found = true;
        }

        if (!found) {
            deleteLastSearch();
        }
    }

    data = {
        type: type,
        name: name,
        spotifyId: spotifyId,
        imageUrl: imageUrl,
        additionalInfo: additionalInfo
    }

    console.log(data);

    await insertLastSearch(data)
}

async function getLastSearches() {
    sql = "SELECT * FROM lastSearches"
    var result = await getFromDB(sql)
    return result
}

async function getFollowedArtists() {
    return window.electronAPI.getFollowedArtists()
}

async function getFollowStatus(id) {
    return window.electronAPI.getFollowStatus(id)
}

async function followArtistDB(id, latestReleaseId) {
    window.electronAPI.followArtist(id, latestReleaseId)
}

async function unfollowArtistDB(id) {
    window.electronAPI.unfollowArtist(id)
}

async function generateSong(info) {
    return window.electronAPI.generateSong(info)
}