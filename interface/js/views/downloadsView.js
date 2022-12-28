downloadedSongs = [];
downloadedSongInfo = [];

function downloads_view() {
    console.log("downloads_view");
    stopMenuLogoColorChange(false);
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

        addHTMLSong(songImageUrl, songTitle, artistsText, songId, "done", index);
    }

}

function addHTMLSong(songImage, title, artistText, songId, progress, index) {
    const container = document.getElementById('downloads_tracks_container');

    const track = document.createElement('div');
    track.classList.add('downloads_track_item');

    const trackImageSpacer = document.createElement('div');
    trackImageSpacer.classList.add('downloads_track_image_spacer');

    const trackImageConatiner = document.createElement('div');
    trackImageConatiner.classList.add('downloads_track_image_container');

    const trackImage = document.createElement('img');
    trackImage.classList.add('downloads_track_image');
    trackImage.src = songImage;

    trackImageConatiner.appendChild(trackImage);

    const trackName = document.createElement('p');
    trackName.classList.add('downloads_track_name');
    trackName.innerText = title;

    const trackArtist = document.createElement('p');
    trackArtist.classList.add('downloads_track_artist');
    trackArtist.innerText = artistText;

    const trackProgress = document.createElement('p');
    trackProgress.classList.add('downloads_track_progress');
    trackProgress.innerText = progress;

    track.appendChild(trackImageSpacer);
    track.appendChild(trackImageConatiner);
    track.appendChild(trackName);
    track.appendChild(trackArtist);
    track.appendChild(trackProgress);

    track.addEventListener("click", function () {
        playDownloadedSong(index);
    });

    container.appendChild(track);
    
    downloadedSongs[songId] = track;
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