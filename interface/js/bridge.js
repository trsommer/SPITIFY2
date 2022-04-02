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

async function getYoutubeUrl(query) {
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

async function sendNotification(title, body) {
    window.electronAPI.sendNotification(title, body)
}

