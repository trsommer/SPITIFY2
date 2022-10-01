var playState = false

async function play(song) {
    //plays a song
    setSpecificProgress(0);
    const audio = document.getElementById("menu_player_audio");
    audio.src = song.getSongStreamingUrl();
    addInfoToPlayer(song);
    setSpecificVolume(song.getSongPreferredVolume());
    changePlayState();
    animatePlayerIn();
}

async function addInfoToPlayer(song) {
    //adds information (cover image, title, artists) to the player
    const playerImage = document.getElementById("menu_player_cover");
    playerImage.src = song.getSongImageUrl();
    setPlayerText(song.getSongTitle(), song.getArtistsAsString())

    setLikeIcon(song.getSongLikeStatus());
}

async function playSongWithoutCover(info) {
    //deprecated
    song = await new Song(info)
    console.log(song)
    addToQueue(song)
    playQueue()
}

async function likeCurrentSong() {
    //like or dislike the current song
    currentSong = getCurrentSong()
    if(currentSong == null) return
    currentSong.likeSong()
    setLikeIcon(currentSong.getSongLikeStatus())
}

async function playSong(info, albumCover) {
    //deprecated
    song = await new Song(info, albumCover)
    addToQueue(song)
    playQueue()
}

function onEndPlay() {
    //controls the transition between songs
    const lastSong = getCurrentSong()
    lastSong.savePreferredVolume();
    addToPlayedQueue(lastSong)
    clearCurrentlyPlaying()
    playQueue()
    //changePlayState()
    //setSpecificVolume(getCurrentSong().getSongPreferredVolume());
    //console.log(playedQueue)
}

function updatePlayerSlider(progress) {
    var slider = document.getElementById('menu_player_slider')
    slider.value = progress
}

function getProgress() {
    const audioElement = document.getElementById('menu_player_audio')
    var currentTime = audioElement.currentTime
    var duration = audioElement.duration

    return 100 * (currentTime / duration)
}

function setProgress() {
    const progress = getProgress();
    updatePlayerSlider(progress)
}

function setSpecificProgress(progress) {
    updatePlayerSlider(progress)
}

function updateVolumeSlider(volume) {
    const audioSlider = document.getElementById('menu_player_volume_slider');
    audioSlider.value = volume;
}

function getCurrentVolume() {
    const audioSlider = document.getElementById('menu_player_volume_slider');
    return audioSlider.value;
}

function changePlayState() {
    const audioElement = document.getElementById('menu_player_audio')
    var playPauseIcon = document.getElementById('menu_player_icon1')

    if (playState == true) {
        audioElement.pause()
        playState = false
        playPauseIcon.src = 'icons/play/play.svg'
    } else {
        audioElement.play()
        playState = true
        playPauseIcon.src = 'icons/play/pause.svg'
    }
}

function skipTo(object) {
    const audioElement = document.getElementById('menu_player_audio')
    value = object.value
    console.log(value);
    var duration = audioElement.duration

    var newProgress = duration * value / 100

    audioElement.currentTime = newProgress
}

function getPlayerState() {
    return playerState
}

function setPlayerText(title, artistString) {
    titleHTML = document.getElementById("menu_player_text_title")
    artistsHTML = document.getElementById("menu_player_text_artists")

    titleHTML.innerHTML = title
    artistsHTML.innerHTML = artistString
}

function setVolume() {
    const volumeSlider = document.getElementById('menu_player_volume_slider')
    const value = volumeSlider.value
    const audioElement = document.getElementById('menu_player_audio')
    const newVolume = value / 100

    audioElement.volume = newVolume
}

function setSpecificVolume(volume) {
    if (volume == null) return
    const audioElement = document.getElementById('menu_player_audio')
    audioElement.volume = volume
}

function skipTrack() {
    if (getQueue().length == 0) return;
    setSpecificProgress(0);
    const audioElement = document.getElementById('menu_player_audio');
    addToPlayedQueue(currentSong);
    clearCurrentlyPlaying();
    playQueue();

    changePlayState();
}

function goBackTrack() {
    const audioElement = document.getElementById('menu_player_audio')
    const progress = getProgress();
    console.log(progress);
    if(progress < 10 && getPlayedQueue().length > 0) {
        //if the song is less than 10% played, go to the previous song
        skipToPreviousTrack();

    } else {
        //if the song is more than 10% played, go back to the start of the song
        setSpecificProgress(0);
        audioElement.currentTime = 0;
    }
}

function skipToPreviousTrack() {
    console.log("skipping to previous track");
    const previousSong = playedQueue.pop();

    if(currentSong != null) {
        addToPlayedQueue(currentSong)
    }
    clearCurrentlyPlaying();
    currentSong = previousSong;
    play(currentSong);
    changePlayState();
}

function setLikeIcon(liked) {
    let dislikeIcon = 'icons/play/hollowHeart.svg'
    let likeIcon = 'icons/play/heart.svg'

    let newLikeIcon = liked ? likeIcon : dislikeIcon

    document.getElementById('menu_player_icon3').src = newLikeIcon
}