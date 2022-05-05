var tracks = []
var playlistName = ""
var playlistId = 0;

function playlist_view() {

}

function setContentPlaylist(playlistData, songData) {
    clearPlaylistView();
    setHeaderContentPlaylist(playlistData);
    if (songData.length > 0) {
        setSongsContentPlaylist(songData)
        tracks = songData;
    }
}

function setHeaderContentPlaylist(playlistData) {
    title = document.getElementById("playlist_header_text");
    namePlaylist = playlistData.name;
    playlistId = playlistData.id;
    if (namePlaylist == "") {
        namePlaylist = "Playlist" + playlistData.id;
    }
    playlistName = namePlaylist;
    title.innerHTML = namePlaylist
}

async function setHeaderImage(url) {
    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = url;
    bgImage.src = url;

    colorString = await getColors("playlist_header_image")
    document.documentElement.style.setProperty("--accentColor", colorString)
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
        title = song.title
        imageUrl = song.imageUrl
        duration = song.duration
        artistsText = getArtistString(JSON.parse(song.artists)["items"])

        console.log(song);

        if (index == 0) {
            setHeaderImage(imageUrl);
        }

        console.log(song.duration);

        songContainer = document.createElement("div");
        songContainer.classList.add("playlist_track_item");

        numberContainer = document.createElement("div");
        numberContainer.classList.add("playlist_track_number_container");

        number = document.createElement("p");
        number.classList.add("playlist_track_number");
        number.innerHTML = index + 1;

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

        numberContainer.appendChild(number);

        songContainer.appendChild(numberContainer);
        songContainer.appendChild(image);
        songContainer.appendChild(songTitle);
        songContainer.appendChild(artists);
        songContainer.appendChild(durationHTML);

        songContainer.addEventListener("click", function() {
            playTrackPlaylist(index);
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