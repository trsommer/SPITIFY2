var playState = false

document.addEventListener('keydown', (e) => {
    console.log(e.key);
    //closes context menu on esc
      if (e.key == " " && e.target.nodeName != "INPUT") {
        e.preventDefault();
        if (getCurrentSong() == null) {
            lastSongInfo = getLastPlayedSongInfo();
            playNewSong(lastSongInfo);
            return
        };
        changePlayState();
    }
});

function onPlaystateChange() {
    const audioElement = document.getElementById('menu_player_audio')
    audioPaused = audioElement.paused
    if (audioPaused == false) {
        manualPlay();
        setContinusProgress();
    }
    if (audioPaused == playState) {
        changePlayStateVariable(audioPaused)
    }
}

  //event listener for change in playstate - check if missmatch between playstate and audio element

async function manualPlay() {
    if (getCurrentSong() == null) {
        const info = getLastPlayedSongInfo();
        playNewSong(info);
        return
    }
    //changePlayState();
}

async function play(song) {
    //plays a song
    await setMediaSessionAPI(song);
    setSpecificProgress(0);
    const audio = document.getElementById("menu_player_audio");
    audio.src = song.getSongStreamingUrl();
    addInfoToPlayer(song);
    setSpecificVolume(song.getSongPreferredVolume());
    setPlayState(true);
    animatePlayerIn();
    createNewNotification(song);
    indicateCurrentlyPlaying(song.getSongSpotifyId());
}

async function addInfoToPlayer(song) {
    //adds information (cover image, title, artists) to the player
    const playerImage = document.getElementById("menu_player_cover");
    playerImage.src = song.getSongImageUrl();
    setPlayerText(song.getSongTitle(), song.getArtistsAsString())

    setLikeIcon(song.getSongLikeStatus());
}

function createNewNotification(song) {
    data = {
        title: song.getSongTitle(),
        subTitle: song.getArtistsAsString(),
        body: song.getAlbumName(),
        imageUrl: song.getSongImageUrl()
    }

    sendNotification(data)
}

async function setMediaSessionAPI(song) {
    navigator.mediaSession.metadata = await new MediaMetadata({
        title: song.getSongTitle(),
        artist: song.getArtistsAsString(),
        album: "Album",
        artwork: [
            { src: song.getSongImageUrl() }
        ]
    });

    //TODO sometimes the information is not updated - NO IDEA WHY ..........

    navigator.mediaSession.setActionHandler('previoustrack', async function () {
        goBackTrack();
        await setTimeout(function(){
        }, 100);
    });
    navigator.mediaSession.setActionHandler('nexttrack', async function () {
        await skipTrack();
        await setTimeout(function(){
        }, 100);
    });
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
    setSpecificProgress(0);
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

function setContinusProgress() {
    const audioElement = document.getElementById('menu_player_audio')
    var currentTime = audioElement.currentTime
    var duration = audioElement.duration

    progress = 100 * (currentTime / duration)
    if (playState == false) {
        return
    }
    document.getElementById('menu_player_slider').value = progress

    window.requestAnimationFrame(setContinusProgress)
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

function setPlayState(state) {
    const audioElement = document.getElementById('menu_player_audio')
    var playPauseIcon = document.getElementById('menu_player_play')
    if (audioElement.src == "") return;

    if (state == false) {
        audioElement.pause()
        playPauseIcon.src = 'icons/play/play.svg'
        setPlayStateVariable(false)
    } else {
        audioElement.play()
        playPauseIcon.src = 'icons/play/pause.svg'
        setPlayStateVariable(true)
    }
}

function changePlayState() {
    const audioElement = document.getElementById('menu_player_audio')
    var playPauseIcon = document.getElementById('menu_player_play')
    if (audioElement.src == "") return;

    if (playState == true) {
        audioElement.pause()
        playPauseIcon.src = 'icons/play/play.svg'
        setPlayStateVariable(false)
    } else {
        audioElement.play()
        playPauseIcon.src = 'icons/play/pause.svg'
        setPlayStateVariable(true)
    }
}

function changePlayStateVariable() {
    if (playState) {
        playState = false
    } else {
        playState = true
    }
}

function setPlayStateVariable(state) {
    playState = state
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

    updateVolumeSlider(volume * 100)
}

function skipTrack() {
    if (getQueue().length == 0) return;
    setSpecificProgress(0);
    const audioElement = document.getElementById('menu_player_audio');
    currentSong.savePreferredVolume();
    addToPlayedQueue(currentSong);
    clearCurrentlyPlaying();
    playQueue();
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
        getQueue().unshift(currentSong);
    }
    clearCurrentlyPlaying();
    currentSong = previousSong;
    play(currentSong);
}

function setLikeIcon(liked) {
    let dislikeIcon = 'icons/play/hollowHeart.svg'
    let likeIcon = 'icons/play/heart.svg'

    let newLikeIcon = liked ? likeIcon : dislikeIcon

    document.getElementById('menu_player_like').src = newLikeIcon
}