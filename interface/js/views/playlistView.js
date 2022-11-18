var tracks = []
var playlistName = ""
var playlistId = 0;
let id;
var playlistPictureSongId = "";

async function playlist_view() {

}

async function setContentPlaylist(playlistData, songData, thisid) {
    clearPlaylistView();
    setHeaderContentPlaylist(playlistData);
    setSongsContentPlaylist(songData)
    tracks = songData;
    id = thisid;

    //makes use of the sortable library

    if (playlistData.locked = 0) {
        await Sortable.create(playlist_tracks_container, {
            animation: 150,
            group: "localStorage-example",
            store: {
                set: function (sortable) {
                    const newOrder = sortable.toArray();
                    updatePlaylist(playlistId, newOrder);
                    updatePictureAfterSorting(newOrder);
                }
            }
    
        });
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

    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = "standardImages/cover.jpg";
    bgImage.src = "standardImages/cover.jpg";
}

function setSongsContentPlaylist(songData) {
    playlistContainer = document.getElementById("playlist_tracks_container");
    playlistContainer.innerHTML = "";
    var completeDuration = 0.0;
    var songNr = 0;

    for (let index = 0; index < songData.length; index++) {
        const song = songData[index];
        const songInfo = JSON.parse(song.info);
        title = songInfo.songTitle;
        imageUrl = songInfo.songImageUrl;
        duration = playlistTimeConvert(songInfo.songDuration);
        completeDuration += songInfo.songDuration;
        artistsText = getArtistString(JSON.parse(songInfo.songArtistArray)["items"])
        id = song.id;

        if (index == 0) {
            setHeaderImage(imageUrl);
        }

        songContainer = document.createElement("div");
        songContainer.classList.add("playlist_track_item");
        songContainer.setAttribute("data-id", id);

        image = document.createElement("img");
        image.classList.add("playlist_track_image");
        image.src = imageUrl;

        songTitle = document.createElement("p");
        songTitle.classList.add("playlist_track_name");
        songTitle.innerHTML = title;

        artists = document.createElement("p");
        artists.classList.add("playlist_track_artists");
        artists.innerHTML = artistsText;

        durationHTML = document.createElement("p");
        durationHTML.classList.add("playlists_track_duration");
        durationHTML.innerHTML = duration;

        songContainer.appendChild(image);
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

    }

    var songNr = songData.length + " songs";

    var infoString = songNr;

    if (songData.length != 0) {
        infoString += ", " + convertMS(completeDuration);
    }

    document.getElementById("playlist_header_info").innerHTML = infoString;
}

function playTrackPlaylist(id) {
    songInfo = tracks[id];
    playSongNow(songInfo);
}

async function playPlaylist() {
    const firstSong = tracks[0];
    playSongNow(firstSong);

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

function openPlaylistContextMenu() {
    //spawnPlaylistMenu();
}