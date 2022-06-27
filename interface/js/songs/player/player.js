var playState = false

async function play(song) {
    const audio = document.getElementById("menu_player_audio");
    audio.src = song.getSongStreamingUrl();
    addInfoToPlayer(song);
    setSpecificVolume(song.getSongPreferredVolume());
    changePlayState();
    animatePlayerIn();
}

async function addInfoToPlayer(song) {
    const playerImage = document.getElementById("menu_player_cover");
    playerImage.src = song.getSongImageUrl();
    setPlayerText(song.getSongTitle(), song.getArtistsAsString())
}

async function playSongWithoutCover(info) {
    song = await new Song(info)
    console.log(song)
    addToQueue(song)
    playQueue()
}

async function likeCurrentSong() {
    currentSong = getCurrentSong()
    if(currentSong == null) return
    currentSong.likeSong()
}

async function playSong(info, albumCover) {
    song = await new Song(info, albumCover)
    addToQueue(song)
    playQueue()
}

function onEndPlay() {
    var lastSong = getCurrentSong()
    addToPlayedQueue(lastSong)
    clearCurrentlyPlaying()
    playQueue()
    changePlayState()
    console.log(playedQueue)
}

function updatePlayerSlider(progress) {
    var slider = document.getElementById('menu_player_slider')
    slider.value = progress
}

function setProgress() {
    const audioElement = document.getElementById('menu_player_audio')
    var currentTime = audioElement.currentTime
    var duration = audioElement.duration

    var progress = 100 * (currentTime / duration)
    updatePlayerSlider(progress)
    //console.log(progress);
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
    const audioElement = document.getElementById('menu_player_audio')
    audioElement.volume = volume;
}

function skipTrack() {
    var paused
    const audioElement = document.getElementById('menu_player_audio')
    if(!audioElement.paused) paused = false
    if(getQueueLength() == 0) return
    
    clearCurrentlyPlaying()
    playQueue()

    if(!paused) changePlayState()
}

function setLikeIcon(liked) {
    let dislikeIcon = 'icons/play/hollowHeart.svg'
    let likeIcon = 'icons/play/heart.svg'

    let newLikeIcon = liked ? likeIcon : dislikeIcon

    document.getElementById('menu_player_icon3').src = newLikeIcon
}