playState = false

async function playSong(info) {
    console.log(info)
    song = new Song(info)
    addToQueue(song)
    playQueue()
    sendNotification(currentSong.getName(), currentSong.getArtistsAsString())
}

function onEndPlay() {
    clearCurrentlyPlaying()
    playQueue()
    changePlayState()
}

function updatePlayerSlider(progress) {
    var slider = document.getElementById('menu_player_slider')
    slider.value = progress
}

function setProgress() {
    var audioPlayer = document.getElementById('menu_player_audio')

    var currentTime = audioPlayer.currentTime
    var duration = audioPlayer.duration

    var progress = 100 * (currentTime / duration)
    updatePlayerSlider(progress)
    //console.log(progress);
}

function changePlayState() {
    var audioPlayer = document.getElementById('menu_player_audio')
    var playPauseIcon = document.getElementById('menu_player_icon1')

    if (playState == true) {
        audioPlayer.pause()
        playState = false
        playPauseIcon.src = 'icons/play/play.svg'
    } else {
        audioPlayer.play()
        playState = true
        playPauseIcon.src = 'icons/play/pause.svg'
    }
}

function skipTo(value) {
    var audioPlayer = document.getElementById('menu_player_audio')
    var duration = audioPlayer.duration

    var newProgress = duration * value / 100

    audioPlayer.currentTime = newProgress
}

function getPlayerState() {
    return playerState
}
