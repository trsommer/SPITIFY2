spotifyIds = []
songInfo = []
var albums = []

function setContentSearch(content) {
    artists = content["artists"]
    songs = content["tracks"]
    albums = content["albums"]
    setHighlightContent(artists)
    setOtherArtistsContent(artists)
    setSongsContent(songs)
    setAlbumContent(albums)

    console.log(spotifyIds);
}

function setHighlightContent(content) {
    data = content["items"]["0"]
    if(data == undefined) return
    url = data["visuals"]["avatarImage"]["sources"]["0"]["url"]
    artistName = data["profile"]["name"]
    spotifyURI = data["uri"]
    spotifyIds["highlight"] = spotifyURI.replace("spotify:artist:", "")

    document.getElementById("search_most_relevant_image").src = url
    document.getElementById("search_most_relevant_result_image_heading").innerHTML = artistName
}

function setOtherArtistsContent(content) {

    otherArtists = []

    for (var i = 0; i < 3; i++) {
        data = content["items"][i+1]
        if (data == undefined) return
        artistContainer = document.getElementById("search_results_artist_" + i)
        image = artistContainer.querySelector(".search_results_artist_image")
        nameArtist = artistContainer.querySelector(".search_results_artist_text_artist")
        spotifyURI = data["uri"]
        otherArtists[i] = spotifyURI.replace("spotify:artist:", "")


        try {
            image.src = data["visuals"]["avatarImage"]["sources"][0]["url"]
        } catch(error) {
            image.src = "standardImages/cover.jpg"
        }

        try {
            nameArtist.innerHTML = data["profile"]["name"]
        } catch (error) {
            console.log(error);
        }

    }

    spotifyIds["otherArtists"] = otherArtists
}

function setSongsContent(content) {

    songs = []

    for (let i = 0; i < 5; i++) {
        trackContainer = document.getElementById("song_result_" + i)
        if(trackContainer == undefined) return
        track = content["items"][i]["track"]
        image = trackContainer.querySelector(".search_result_track_image")
        nameTrack = trackContainer.querySelector(".search_results_song_text_title")
        nameArtist = trackContainer.querySelector(".search_results_song_text_artist")
        trackTime = trackContainer.querySelector(".search_results_song_text_time")
        songs[i] = track["id"]

        songInfo[i] = track


        trackImageUrl = track["album"]["coverArt"]["sources"][0]["url"]

        image.src = track["album"]["coverArt"]["sources"][0]["url"]
        nameTrack.innerHTML = track["name"]

        artists = track["artists"]["items"]
        artistString = ""

        for (var j = 0; j < artists.length; j++) {
            if (j == 0) {
                artistString = artists["0"]["profile"]["name"]
            } else {
                artistString = artistString + ", " + artists[j]["profile"]["name"]
            }
        }

        nameArtist.innerHTML = artistString

        trackTimeMS = track["duration"]["totalMilliseconds"]

        trackTimeFormated = timeConvert(trackTimeMS)

        trackTime.innerHTML = trackTimeFormated

    }

    spotifyIds["songs"] = songs
}

function setAlbumContent(content) {
    data = content["items"]
    albums = data

    for (var i = 0; i < 5; i++) {
        albumData = data[i]
        if (albumData == undefined) {
            break;
        }
        albumName = albumData["name"]
        albumType = albumData["type"]

        try {
            imgUrl = albumData["coverArt"]["sources"]["0"]["url"]
        } catch (error) {
            imgUrl = "standardImages/cover.jpg"
        }

        albumContainer = document.getElementById("search_results_album_" + i)

        albumContainer.querySelector(".search_results_album_image").src = imgUrl
        albumContainer.querySelector(".search_results_album_text_title").innerHTML = albumName
        albumContainer.querySelector(".search_results_album_text_type").innerHTML = albumType


    }

}

function playSongSearchView(id) {
    console.log(songInfo);
    playSong(songInfo[id])
}

async function openAlbum(id) {
    var album = albums[id]
    var spotifyURI = album["uri"]
    var theSplit = spotifyURI.split(":")
    setupAlbumView(theSplit[2], album)
}
