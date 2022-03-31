async function getSpotifyArtist(id) {
    returnArray = await window.electronAPI.getArtistInfo(id)
    
    return returnArray["data"]["artist"]
}

async function getSpotifySearchResults(query) {
    returnArray = await window.electronAPI.searchSpotify(query)

    return returnArray["data"]["search"]
}

async function getYoutubeUrl(query) {
    returnArray = await window.electronAPI.searchYoutube(query)

    console.log(query);

    return returnArray
}

async function getStreamingUrl(url) {
    result = await window.electronAPI.convertURL(url)

    return result
}

