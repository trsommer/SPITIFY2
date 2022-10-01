var tracks = []
var info = []

function album_view() {}

async function setupAlbumView(id, additionalInfo) {
    var albumInfo = await getSpotifyAlbum(id)
    console.log(additionalInfo);
    console.log(albumInfo);
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

    header = document.getElementById("album_view_header")

    title = info["name"]
    test = [... title]
    if (test.length > 25) {
        //long title
        header.classList.add("album_view_header_small")
        header.classList.remove("album_view_header_big")
    } else {
        //small title
        header.classList.remove("album_view_header_small")
        header.classList.add("album_view_header_big")
    }
    header.innerHTML = title

    artists = ""
    date = info["date"]["year"]
    heading2 = ""

    if (info.artists != undefined) {
        artists = info["artists"]["items"]
        artistString = getArtistString(artists)
        heading2 = artistString + " - "
    }

    heading2 += date

    document.getElementById("album_view_2ndHeader").innerHTML = heading2

    console.log(info);

    let uri = info["uri"]
    let id = uri.split(":")[2]

    let jsonAddtitionalInfo = JSON.stringify(info)

    addLastSearch('album', title, id, imageUrl, jsonAddtitionalInfo)
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
    track = tracks[id]["track"]
    if (track.album == undefined) {
        track.album = {"name": info["name"], "coverArt": {"sources": info["coverArt"]["sources"]}}
    }
    playSong(track)
}

function getAlbumCover() {
    return info["coverArt"]["sources"][2]["url"]

}

async function playSongsAlbum() {
    //self explanatory
    clearQueue()
    for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        console.log(track);

        //adds the album name to the track object - temp solution
        if (track.album == undefined) {
            const uri = info["uri"]
            const id = uri.split(":")[2]
            track["track"]["album"] = {"name": info["name"], "id": id, "coverArt": info["coverArt"]}
        }
        song = await new Song(track['track'])
        addToQueue(song)
    }
    playQueue();
}

async function shuffleSongsAlbum() {
    clearQueue()
    var shuffledArray = [...tracks]
    shuffleArray(shuffledArray)
    for (let index = 0; index < shuffledArray.length; index++) {
        const thisTrack = shuffledArray[index]
        song = await new Song(thisTrack["track"])
        addToQueue(song)
    }
    playQueue();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}