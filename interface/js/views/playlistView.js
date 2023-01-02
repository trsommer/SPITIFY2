var tracks = []
var tracksHTML = []
var playlistName = ""
var playlistId = 0;
let id;
var playlistPictureSongId = "";
var playlistPlayingTrack = null;

async function playlist_view() {
    await Sortable.create(playlist_tracks_container, {
        animation: 150,
        group: "localStorage-example",
        store: {
            set: function (sortable) {
                console.log('test');
                const newOrder = sortable.toArray();
                updatePlaylist(playlistId, newOrder);
                changeTrackListSorting(newOrder);
                if (tracks.length >= 4) {
                    createQuadHeaderImage(tracks)
                } else {
                    updatePictureAfterSorting(newOrder);
                }
            }
        }

    });

}

async function setContentPlaylist(playlistData, songData, thisid) {
    clearPlaylistView();
    setHeaderContentPlaylist(playlistData);
    await setSongsContentPlaylist(songData)
    tracks = songData;
    id = thisid;

    //makes use of the sortable library

    if (playlistData.locked = 0) {

    }
}

function setHeaderContentPlaylist(playlistData) {
    title = document.getElementById("playlist_header_text");
    authorHTML = document.getElementById("playlist_header_author");
    namePlaylist = playlistData.name;
    playlistId = playlistData.id;
    if (namePlaylist == "") {
        namePlaylist = "Playlist" + playlistData.id;
    }
    playlistName = namePlaylist;
    title.innerHTML = namePlaylist;
    authorHTML.innerHTML = "by " + playlistData.author;
}

async function setHeaderImage(url, songId) {
    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = url;
    bgImage.src = url;

    colorString = await getColors("playlist_header_image")
    document.documentElement.style.setProperty("--accentColor", colorString)
    changePlaylistImage(id, url);
    playlistPictureSongId = songId;
}

function clearPlaylistView() {
    playlistContainer = document.getElementById("playlist_tracks_container");
    playlistContainer.innerHTML = "";

    playlistQuadImageBackgroundContainer = document.getElementById("playlist_image_quad_background_container");
    playlistQuadImageBackgroundContainer.innerHTML = "";

    playlistHeaderQuadImageContainer = document.getElementById("playlist_header_quadImage_container");
    playlistHeaderQuadImageContainer.innerHTML = "";

    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = "standardImages/cover.jpg";
    bgImage.src = "standardImages/cover.jpg";
}

async function setSongsContentPlaylist(songData) {
    playlistContainer = document.getElementById("playlist_tracks_container");
    playlistContainer.innerHTML = "";
    var completeDuration = 0.0;
    var songNr = 0;

    if (songData.length >= 4) {
        await createQuadHeaderImage(songData)
    }

    for (let index = 0; index < songData.length; index++) {
        const song = songData[index];
        if (song == undefined) {
            continue;
        }
        const songInfo = JSON.parse(song.info);
        title = songInfo.songTitle;
        imageUrl = songInfo.songImageUrl;
        duration = playlistTimeConvert(songInfo.songDuration);
        completeDuration += songInfo.songDuration;
        artistsText = getArtistString(JSON.parse(songInfo.songArtistArray)["items"])
        id = song.id;

        if (index == 0 && songData.length < 4) {
            setHeaderImage(imageUrl);
        }

        songContainer = document.createElement("div");
        songContainer.classList.add("track_item");
        songContainer.setAttribute("data-id", id);

        spacer = document.createElement("div");
        spacer.classList.add("track_spacer_left");

        imageContainer = document.createElement("div");
        imageContainer.classList.add("track_image_container");

        image = document.createElement("img");
        image.classList.add("track_image");
        image.src = imageUrl;

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
            playlistPlayingTrack = {
                "id": id,
                "html": songContainer
            }       
        }

        currentlyPlayingContainer.appendChild(currentlyPlayingBackground);
        currentlyPlayingContainer.appendChild(currentlyPlayingImage);

        imageContainer.appendChild(image);
        imageContainer.appendChild(currentlyPlayingContainer);

        songTitle = document.createElement("p");
        songTitle.classList.add("track_text_left");
        songTitle.innerHTML = title;

        artists = document.createElement("p");
        artists.classList.add("track_text_middle");
        artists.innerHTML = artistsText;

        durationHTML = document.createElement("p");
        durationHTML.classList.add("track_text_right");
        durationHTML.innerHTML = duration;

        songContainer.appendChild(spacer);
        songContainer.appendChild(imageContainer);
        songContainer.appendChild(songTitle);
        songContainer.appendChild(artists);
        songContainer.appendChild(durationHTML);

        songContainer.addEventListener("click", function() {
            playTrackPlaylist(index);
        })
        songContainer.addEventListener("contextmenu", (e) => {
            setClickedPlaylistSong(tracks[index], playlistId);
            spawnPlaylistMenu(e);
          });
        playlistContainer.appendChild(songContainer);

        tracksHTML.push({id: id, html: songContainer})
    }

    var songNr = songData.length + " songs";

    var infoString = songNr;

    if (songData.length != 0) {
        infoString += ", " + convertMS(completeDuration);
    }

    document.getElementById("playlist_header_info").innerHTML = infoString;
}

async function createQuadHeaderImage(songData) {
    const quadImageContainer = document.getElementById('playlist_header_quadImage_container');
    const quadImageBackgroundContainer = document.getElementById('playlist_image_quad_background_container');
    quadImageContainer.innerHTML = "";
    quadImageBackgroundContainer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
        const song = songData[i];
        const songInfo = JSON.parse(song.info);
        const imageUrl = songInfo.songImageUrl;

        //foreground

        imageContainer = document.createElement("div");
        imageContainer.classList.add("playlist_header_quadImage_image_container");

        image = document.createElement("img");
        image.classList.add("playlist_header_image_quad");
        image.src = imageUrl;

        if (i == 0) {
            image.id = "playlist_header_quad_mainImage";
        }

        imageContainer.appendChild(image);

        quadImageContainer.appendChild(imageContainer);

        //background

        image = document.createElement("img");
        image.classList.add("playlist_header_background_image_quad");
        image.src = imageUrl;

        quadImageBackgroundContainer.appendChild(image);
    }

    colorString = await getColors("playlist_header_quad_mainImage")
    document.documentElement.style.setProperty("--accentColor", colorString)

}

async function playTrackPlaylist(id) {
    songInfo = tracks[id];
    await playSongNow(songInfo);

    clearQueue();

    for (let index = id + 1; index < tracks.length; index++) {
        const track = tracks[index];
        song = new Song(track);
        addToQueue(song);
    }
}

async function playPlaylist() {
    const firstSong = tracks[0];
    await playSongNow(firstSong);

    clearQueue();

    for (let index = 1; index < tracks.length; index++) {
        const track = tracks[index];
        song = await new Song(track);
        addToQueue(song);
    }
}

async function shufflePlaylist() {
    var shuffledArray = [...tracks]
    shuffleArray(shuffledArray)

    const firstSong = tracks[0];
    playSongNow(firstSong);

    clearQueue();

    for (let index = 1; index < shuffledArray.length; index++) {
        const thisTrack = shuffledArray[index]
        song = await new Song(thisTrack);
        addToQueue(song);
    }
}

function playlistNameChange() {
    let playlistNewName = document.getElementById("playlist_header_text").innerHTML;
    if (playlistNewName != playlistName) {
        changePlaylistName(playlistId, playlistNewName);
        playlists[playlistId - 1].name = playlistNewName;
    }
}

function togglePlaylistEdit() {
    let editModeIndicator = document.getElementById("playlist_editMode_indicator");

    if (playlistEdit) {
        editModeIndicator.style.animation = "editModeOff 0.3s forwards";
        playlistEdit = false;
    } else {
        editModeIndicator.style.animation = "editModeOn 0.3s forwards";
        playlistEdit = true;
    }
}

function playlistTimeConvert(ms) {
    const seconds = Math.floor(ms / 1000);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

//convert ms into hours, minutes and seconds
function convertMS(ms) {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    d = Math.floor(h / 24);
    h = h % 24;

    returnString = "";

    if (d > 0) {
        returnString += d + " Days, ";
    }
    if (h > 0) {
        returnString += h + " hours, ";
    }
    if (m > 0) {
        returnString += m + " minutes";
    }

    return returnString;
}


function removeSongFromThisPlaylist(id, playlistId) {
    removePlaylistSong(id, playlistId);
    const element = document.querySelector(`[data-id="${id}"]`);

    element.parentNode.removeChild(element);

    console.log(element);

}

function updatePictureAfterSorting(newOrder) {
    console.log(newOrder[0]);
    if (playlistPictureSongId == newOrder[0]) {
        return
    }
        
    for (let i = 0; i < 15; i++) {
        const track = tracks[i];
        
        if (track.id == newOrder[0]) {
            setHeaderImage(JSON.parse(track.info).songImageUrl, newOrder[0]);
            break;
        }

    }


}

function changeTrackListSorting(newOrder) {
    //order the list of tracks with id in newOrder
    var newTrackList = [];

    for (let i = 0; i < newOrder.length; i++) {
        const id = newOrder[i];
        for (let j = 0; j < tracks.length; j++) {
            const track = tracks[j];
            if (track.id == id) {
                newTrackList.push(track);
                break;
            }
        }
    }

    tracks = newTrackList;
}

function openPlaylistContextMenu() {
    //spawnPlaylistMenu();
}

function playlistSongCurrentlyPlaying(id) {
    if (playlistPlayingTrack != null) {
        playlistPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        playlistPlayingTrack = null;
        // if another track is playing, hide the currently playing icon from the previous track (playlistPlayingTrack)
    }

    for (let i = 0; i < tracksHTML.length; i++) {
        const trackHTML = tracksHTML[i];
        if (trackHTML.id == id) {
            trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
            playlistPlayingTrack = trackHTML;
        }
    }
}

function playlistRemoveCurrentlyPlaying() {
    if (playlistPlayingTrack != null) {
        playlistPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        playlistPlayingTrack = null;
    }
}