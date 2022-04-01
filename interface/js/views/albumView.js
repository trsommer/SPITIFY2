var tracks = []
var info = []

async function setupAlbumView(id, additionalInfo) {
    var albumInfo = await getSpotifyAlbum(id)
    var tracks = albumInfo["data"]["album"]["tracks"]["items"]
    var info = additionalInfo

    console.log(tracks);
    console.log(info);
}