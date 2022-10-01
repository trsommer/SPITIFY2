var tracks = []
var playlistName = ""
var playlistId = 0;
var playlistEdit = false;
let id;

async function playlist_view() {
    //makes use of the sortable library
    await Sortable.create(playlist_tracks_container, {
        animation: 150,
        group: "localStorage-example",
        store: {
            set: function (sortable) {
                const newOrder = sortable.toArray();
                updatePlaylist(playlistId, newOrder);
            }
        }

    });
}

function setContentPlaylist(playlistData, songData, thisid) {
    clearPlaylistView();
    setHeaderContentPlaylist(playlistData);
    if (songData.length > 0) {
        setSongsContentPlaylist(songData)
        tracks = songData;
    }
    id = thisid;
}

function setHeaderContentPlaylist(playlistData) {
    title = document.getElementById("playlist_header_text");
    namePlaylist = playlistData.name;
    playlistId = playlistData.id;
    if (namePlaylist == "") {
        namePlaylist = "Playlist" + playlistData.id;
    }
    playlistName = namePlaylist;
    title.innerHTML = namePlaylist;
}

async function setHeaderImage(url) {
    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = url;
    bgImage.src = url;

    colorString = await getColors("playlist_header_image")
    document.documentElement.style.setProperty("--accentColor", colorString)
    changePlaylistImage(id, url);
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

    for (let index = 0; index < songData.length; index++) {
        const song = songData[index];
        const songInfo = JSON.parse(song.info);
        title = songInfo.songTitle;
        imageUrl = songInfo.songImageUrl;
        duration = playlistTimeConvert(songInfo.songDuration);
        artistsText = getArtistString(JSON.parse(songInfo.songArtistArray)["items"])
        id = song.id;

        console.log(song);

        if (index == 0) {
            setHeaderImage(imageUrl);
        }

        console.log(song.duration);

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
            if (!playlistEdit) {
                playTrackPlaylist(index);
            }
        })
        songContainer.addEventListener("mousedown", function(e) {
            if (playlistEdit) {
                playlistMoveStart(index, e);
            }
        })
        playlistContainer.appendChild(songContainer);

    }

}

function playTrackPlaylist(id) {
    clearQueue();
    songInfo = tracks[id];
    console.log(songInfo);
    playSongWithoutCover(songInfo)
}

async function playPlaylist() {
    clearQueue()
    for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        song = await new Song(track);
        addToQueue(song);
    }
    playQueue();
}

async function shufflePlaylist() {
    clearQueue()
    var shuffledArray = [...tracks]
    shuffleArray(shuffledArray)
    for (let index = 0; index < shuffledArray.length; index++) {
        const thisTrack = shuffledArray[index]
        song = await new Song(thisTrack);
        addToQueue(song);
    }
    playQueue();
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