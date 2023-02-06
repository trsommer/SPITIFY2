var tracks = []
var tracksHTML = []
var info = []
var scrolledDown = false;
var albumPlayingTrack = null;

function album_view() {
    setTopMenuOpacity(0);
    stopMenuLogoColorChange(true);
    repositionPlayer(12, 0);
}

function scrollAlbumView(scrollY) {
    if (scrollY > 450 && !scrolledDown) {
        scrolledDown = true;
        changeMenuTopVisibility(false);
        repositionPlayer(12, 60);
    } else if (scrollY < 450 && scrolledDown) {
        scrolledDown = false;
        changeMenuTopVisibility(true);
        repositionPlayer(12, 0);
    }
}

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
        uri = track.uri
        id = uri.split(":")[2]

        trackDiv = document.createElement("div")
        trackDiv.classList.add("track_item")

        trackSpacer = document.createElement("div")
        trackSpacer.classList.add("track_spacer_left")

        trackImageContainer = document.createElement("div")
        trackImageContainer.classList.add("track_image_container")

        trackimage = document.createElement("img")
        trackimage.classList.add("track_image")
        trackimage.src = imageUrl

        currentlyPlayingContainer = document.createElement("div");
        currentlyPlayingContainer.classList.add("currently_playing_container");
        currentlyPlayingContainer.classList.add("playlist_currently_playing_container")

        currentlyPlayingBackground = document.createElement("div");
        currentlyPlayingBackground.classList.add("currently_playing_background");

        currentlyPlayingImage = document.createElement("img");
        currentlyPlayingImage.classList.add("currently_playing_svg");
        currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

        if (currentSong != null && currentSong.getSongSpotifyId() == id) {
            currentlyPlayingContainer.style.display = "flex"; // show currently playing track
            albumPlayingTrack = {
                "id": id,
                "html": trackDiv
            }       
        }

        currentlyPlayingContainer.appendChild(currentlyPlayingBackground)
        currentlyPlayingContainer.appendChild(currentlyPlayingImage)

        trackImageContainer.appendChild(trackimage)
        trackImageContainer.appendChild(currentlyPlayingContainer)

        trackName = document.createElement("p")
        trackName.classList.add("track_text_left")
        trackName.innerHTML = trackNameString

        trackArtists = document.createElement("p")
        trackArtists.classList.add("track_text_middle")
        trackArtists.innerHTML = artistString

        trackTime = document.createElement("p")
        trackTime.classList.add("track_text_right")
        trackTime.innerHTML = trackTimeFormated

        trackDiv.appendChild(trackSpacer)
        trackDiv.appendChild(trackImageContainer)
        trackDiv.appendChild(trackName)
        trackDiv.appendChild(trackArtists)
        trackDiv.appendChild(trackTime)

        document.getElementById("album_view_content").appendChild(trackDiv)

        trackDiv.addEventListener("click", function() {

            playSongAlbum(index)
        })
        trackDiv.addEventListener("contextmenu", (e) => {
            showAlbumContextMenu(index, e)
        })

        tracksHTML.push({id: id, html: trackDiv})
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
    playSongNow(track)
}

function getAlbumCover() {
    return info["coverArt"]["sources"][2]["url"]

}

async function playSongsAlbum() {
    //self explanatory


    for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];

        //adds the album name to the track object - temp solution
        if (track.album == undefined) {
            const uri = info["uri"]
            const id = uri.split(":")[2]
            track["track"]["album"] = {"name": info["name"], "id": id, "coverArt": info["coverArt"]}
        }

        if (index == 0) {
            playSongNow(track['track'])
            clearQueue();
        } else {
            song = await new Song(track['track'])
            addToQueue(song)
        }

    }
}

async function shuffleSongsAlbum() {
    var shuffledArray = [...tracks]
    shuffleArray(shuffledArray)

    for (let index = 0; index < tracks.length; index++) {
        const track = shuffledArray[index];

        //adds the album name to the track object - temp solution
        if (track.album == undefined) {
            const uri = info["uri"]
            const id = uri.split(":")[2]
            track["track"]["album"] = {"name": info["name"], "id": id, "coverArt": info["coverArt"]}
        }

        

        if (index == 0) {
            playSongNow(track['track'])
            clearQueue();
        } else {
            song = await new Song(track['track'])
            addToQueue(song)
        }

    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function importAlbumAsPlaylist() {

    //TODO if songs are not fully loaded into db, things break - needs fixing

    const albumName = info.name;
    const author = getArtistString(info.artists.items)
    const image = info.coverArt.sources[2].url

    const playlistId = await createSpecificPlaylist(albumName, author, image, 1);

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i].track;
        const uri = track["uri"]
        const songId = uri.split(":")[2]

        addPlaylistSong(songId, playlistId)

    }
    
    console.log(info);

    //TODO move task out of main thread to prevent lag

    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i].track;
        if (track.album == undefined) {
            const uri = info["uri"]
            const id = uri.split(":")[2]
            track["album"] = {"name": info["name"], "id": id, "coverArt": info["coverArt"]}
        }
        song = await new Song(track)

    }

}

function showAlbumContextMenu(index, event) {
    track = tracks[index]["track"]
    if (track.album == undefined) {
        track.album = {"name": info["name"], "coverArt": {"sources": info["coverArt"]["sources"]}}
    }

    setClickedAlbumSong(track)
    spawnAlbumMenu(event)
}

function albumSongCurrentlyPlaying(id) {
    if (albumPlayingTrack != null) {
        albumPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        albumPlayingTrack = null;
        // if another track is playing, hide the currently playing icon from the previous track (playlistPlayingTrack)
    }

    for (let i = 0; i < tracksHTML.length; i++) {
        const trackHTML = tracksHTML[i];
        if (trackHTML.id == id) {
            trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
            albumPlayingTrack = trackHTML;
        }
    }
}

function albumRemoveCurrentlyPlaying() {
    if (albumPlayingTrack != null) {
        albumPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        albumPlayingTrack = null;
    }
}