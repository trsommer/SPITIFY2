

async function addLastSearch(type, name, spotifyId, imageUrl, additionalInfo) {
    var lastSearches = await getLastSearches()
    var lastSearchesLength = Object.keys(lastSearches).length

    if (lastSearchesLength == 16) {
        deleteLastSearch()
    }

    for (let index = 0; index < lastSearches.length; index++) {
        const lastSearch = lastSearches[index];
        if (lastSearch.spotifyId == spotifyId) return;
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