downloadedSongs = [];
tracksHTML = [];
downloadedSongInfo = [];
downloadsPlayingTrack = null;


function downloads_view() {
    console.log("downloads_view");
    stopMenuLogoColorChange(false);
    updateDownloadedCurrentyplaying();
    updateTopBarVisible(true);
}

function addDownloadToView(song) {
    const songTitle = song.getSongTitle();
    const songArtist = song.getArtistsAsString();
    const songImageUrl = song.getSongImageUrl();
    const songId = song.getSongSpotifyId();
    const index = downloadedSongInfo.length;
    downloadedSongInfo.push(song);

    addHTMLSong(songImageUrl, songTitle, songArtist, songId, "0%", index);
}

function updateDownloadProgress(songId, progress) {
    const htmlElement = downloadedSongs[songId];
    const progressElem = htmlElement.querySelector('.downloads_track_progress');
    const progressFloat = parseFloat(progress.toFixed(2));
    
    if (progressFloat >= 99) {
        progressElem.innerText = "done";
    } else {
        progressElem.innerText = parseFloat(progress.toFixed(2)) + "%";
    }
}

async function getDownloadIdsFromDB() {
    downloads = await getFromDB("SELECT * FROM downloadedSongs ORDER BY timestamp ASC");
    return downloads;
}

async function getDownloadedSongs(ids) {
    songs = []

    for (let index = 0; index < ids.length; index++) {
        sql = `SELECT * FROM songs WHERE id='${ids[index].id}'`;
        song = await getFromDB(sql);
        songs.push(song[0]);
    }

    return songs;
}

async function loadDownloads() {
    downloadedSongIds = await getDownloadIdsFromDB();
    console.log(downloadedSongIds);
    songs = await getDownloadedSongs(downloadedSongIds);
    console.log(songs);
    downloadedSongInfo = songs;
    clearDownloadsView()

    for (let index = 0; index < songs.length; index++) {
        const song = songs[index];
        songInfo = JSON.parse(song.info);
        songId = song.id;
        songImageUrl = songInfo.songImageUrl;
        songTitle = songInfo.songTitle;
        artistsText = getArtistString(JSON.parse(songInfo.songArtistArray).items);

        addHTMLSong(songImageUrl, songTitle, artistsText, songId, "done", index, songId);


    }

}

function addHTMLSong(songImage, title, artistText, songId, progress, index, id) {
    const container = document.getElementById('downloads_tracks_container');

    const track = document.createElement('div');
    track.classList.add('track_item');

    const trackImageSpacer = document.createElement('div');
    trackImageSpacer.classList.add('track_spacer_left');

    const trackImageContainer = document.createElement('div');
    trackImageContainer.classList.add('track_image_container');

    const trackImage = document.createElement('img');
    trackImage.classList.add('track_image');
    trackImage.src = songImage;

    const currentlyPlayingContainer = document.createElement("div");
    currentlyPlayingContainer.classList.add("currently_playing_container");
    currentlyPlayingContainer.classList.add("playlist_currently_playing_container")

    const currentlyPlayingBackground = document.createElement("div");
    currentlyPlayingBackground.classList.add("currently_playing_background");

    const currentlyPlayingImage = document.createElement("img");
    currentlyPlayingImage.classList.add("currently_playing_svg");
    currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

    currentlyPlayingContainer.appendChild(currentlyPlayingBackground)
    currentlyPlayingContainer.appendChild(currentlyPlayingImage)

    trackImageContainer.appendChild(trackImage)
    trackImageContainer.appendChild(currentlyPlayingContainer)

    const trackName = document.createElement('p');
    trackName.classList.add('track_text_left');
    trackName.innerText = title;

    const trackArtist = document.createElement('p');
    trackArtist.classList.add('track_text_middle');
    trackArtist.innerText = artistText;

    const trackProgress = document.createElement('p');
    trackProgress.classList.add('track_text_right');
    trackProgress.innerText = progress;

    track.appendChild(trackImageSpacer);
    track.appendChild(trackImageContainer);
    track.appendChild(trackName);
    track.appendChild(trackArtist);
    track.appendChild(trackProgress);

    track.addEventListener("click", function () {
        playDownloadedSong(index);
    });

    container.appendChild(track);
    
    downloadedSongs[songId] = track;

    tracksHTML.push({id: id, html: track})
}

function clearDownloadsView() {
    const container = document.getElementById('downloads_tracks_container');
    container.innerHTML = "";
}

async function playDownloadedSong(id) {
    songInfo = downloadedSongInfo[id];

    if (songInfo.id == undefined) {
        replaceQueue(songInfo)
    } else {
        info = JSON.parse(songInfo.info);
        convertedSongInfo = info.songInfo;
        playSongNow(convertedSongInfo)
    }
}

function updateDownloadedCurrentyplaying() {
    for (let i = 0; i < tracksHTML.length; i++) {
        const track = tracksHTML[i];
        if (currentSong != null && currentSong.getSongSpotifyId() == track.id) {
            track.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
            downloadsPlayingTrack = track;
        }
    }
}

function downloadsSongCurrentlyPlaying(id) {
    if (downloadsPlayingTrack != null) {
        downloadsPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        downloadsPlayingTrack = null;
        // if another track is playing, hide the currently playing icon from the previous track (playlistPlayingTrack)
    }

    for (let i = 0; i < tracksHTML.length; i++) {
        const trackHTML = tracksHTML[i];
        if (trackHTML.id == id) {
            trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
            downloadsPlayingTrack = trackHTML;
        }
    }
}

function downloadsRemoveCurrentlyPlaying() {
    if (downloadsPlayingTrack != null) {
        downloadsPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        downloadsPlayingTrack = null;
    }
}