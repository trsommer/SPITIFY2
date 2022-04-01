var tracks = []
var info = []

async function setupAlbumView(id, additionalInfo) {
    var albumInfo = await getSpotifyAlbum(id)
    tracks = albumInfo["data"]["album"]["tracks"]["items"]
    info = additionalInfo
    setContentArtists()
    console.log(tracks)
    addTracks()
    switchView("album_view")
}

async function setContentArtists() {
    imageUrl = info["coverArt"]["sources"][2]["url"]
    if (imageUrl == undefined) {
        imageUrl = "standardImages/cover.jpg"
    }

    document.getElementById("album_view_bgImage").src = imageUrl
    document.getElementById("album_view_cover").src = imageUrl

    colorString = await getColors("album_view_cover")

    document.documentElement.style.setProperty("--accentColor", colorString)

    title = info["name"]
    test = [... title]
    if (test.length > 25) {
        console.log("long title");
    }
    document.getElementById("album_view_header").innerHTML = title

    artists = info["artists"]["items"]
    artistString = getArtistString(artists)
    heading2 = artistString + " - " + info["date"]["year"]

    document.getElementById("album_view_2ndHeader").innerHTML = heading2
}

function addTracks() {
    imageUrl = getAlbumCover()
    contentContainer = document.getElementById("album_view_content")
    contentContainer.innerHTML = ""

    for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index]["track"];
        trackNumberint = index + 1
        trackNameString = track["name"]
        trackDurationMS = track["duration"]["totalMilliseconds"]
        trackTimeFormated = timeConvert(trackDurationMS)
        artists = track["artists"]["items"]
        artistString = getArtistString(artists)

        trackDiv = document.createElement("div")
        trackDiv.classList.add("album_view_track")
        trackNumberDiv = document.createElement("div")
        trackNumberDiv.classList.add("album_view_track_number_container")
        trackNumber = document.createElement("p")
        trackNumber.classList.add("album_view_track_number")
        trackNumber.innerHTML = trackNumberint
        trackNumberDiv.appendChild(trackNumber)
        trackDiv.appendChild(trackNumberDiv)
        trackimage = document.createElement("img")
        trackimage.classList.add("album_view_track_image")
        trackimage.src = imageUrl
        trackDiv.appendChild(trackimage)
        trackName = document.createElement("p")
        trackName.classList.add("album_view_track_text")
        trackName.innerHTML = trackNameString
        trackDiv.appendChild(trackName)
        trackArtists = document.createElement("p")
        trackArtists.classList.add("album_view_track_text")
        trackArtists.classList.add("album_view_track_text_artists") 
        trackArtists.innerHTML = artistString
        trackDiv.appendChild(trackArtists)
        trackTime = document.createElement("p")
        trackTime.classList.add("album_view_track_text")
        trackTime.classList.add("album_view_track_text_duration")
        trackTime.innerHTML = trackTimeFormated
        trackDiv.appendChild(trackTime)
        document.getElementById("album_view_content").appendChild(trackDiv)
        trackDiv.addEventListener("click", function() {
            playSongAlbum(index)
        })
    }
}

function getArtistString(artists) {
    artistString = ""
    for (let index = 0; index < artists.length; index++) {
        const artist = artists[index];
        if (index == 0) {
            artistString = artist["profile"]["name"]
            continue
        }
        artistString += ", " + artist["profile"]["name"]
    }

    return artistString
}

function playSongAlbum(id) {
    songInfo = tracks[id]["track"]
    playSong(songInfo)
}

function getAlbumCover() {
    return info["coverArt"]["sources"][2]["url"]

}