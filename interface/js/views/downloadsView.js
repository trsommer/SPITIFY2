function downloads_view() {
    console.log("downloads_view");
}

function addDownloadToView(song) {
    const songName = song.getSongTitle();
    const songArtist = song.getArtistsAsString();
    const songDuration = song.getSongDuration();
    trackTimeFormated = timeConvert(songDuration)
    const songImage = song.getSongImageUrl();

    const container = document.getElementById('downloads_tracks_container');

    const track = document.createElement('div');
    track.classList.add('downloads_track_item');

    const trackImage = document.createElement('img');
    trackImage.classList.add('downloads_track_image');
    trackImage.src = songImage;

    const trackName = document.createElement('p');
    trackName.classList.add('downloads_track_name');
    trackName.innerText = songName;

    const trackArtist = document.createElement('p');
    trackArtist.classList.add('downloads_track_artist');
    trackArtist.innerText = songArtist;

    const trackDuration = document.createElement('p');
    trackDuration.classList.add('downloads_track_duration');
    trackDuration.innerText = trackTimeFormated;

    track.appendChild(trackImage);
    track.appendChild(trackName);
    track.appendChild(trackArtist);
    track.appendChild(trackDuration);

    container.appendChild(track);
}