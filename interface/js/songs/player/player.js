class Player {
    #viewController = null
    #playState = false
    #shuffleState = false
    #repeatState = 0
    #playerHtmlController = null;
    #queue = null
    #currentSong = null
    #crossfade  = true

    constructor(viewController) {
        this.#viewController = viewController;

        return this.#constructorFunction();
    }

    async #constructorFunction() {
        this.#playerHtmlController = await new PlayerHtmlController(this.#viewController, this);

        return this;
    }

    /*
     * this method plays the current song from the queue.
    */
    async #play(song) {
        this.#currentSong = song
        await this.#setMediaSessionsAPI(song);
        this.#setPlayerImage(song.getSongImageUrl());
        this.#setPlayerInfo(song);
        this.#setSpecificProgress(0);
        this.#setAudioSource(song.getSongStreamingUrl());
        this.#setSpecificVolume(song.getSongPreferredVolume());
        this.setPlayState(true);
    }

    async #playCrossfade(song) {
        this.#currentSong = song
        await this.#setMediaSessionsAPI(song);
        this.#setPlayerImage(song.getSongImageUrl());
        this.#setSpecificProgress(0);
        this.#setAudioSource(song.getSongStreamingUrl());
        this.setPlayState(true);
    }

    async playQueue() {
        const song = this.#queue.getNextSong();
        await this.#play(song);
    }

    async onEndPlay() {
        const nextSong = this.#queue.getNextSong();
        if(nextSong == null) {
            return;
        }
        const targetVolumeOld = this.#currentSong.getSongPreferredVolume();
        const targetVolumeNew = nextSong.getSongPreferredVolume();

        if (this.#crossfade) {
            this.#playCrossfade(nextSong);
            return [targetVolumeOld, targetVolumeNew];
        }

        this.#play(nextSong);
    }

    async pause() {
        this.setPlayState(false);
    }

    registerQueue(queue) {
        this.#queue = queue
    }

    async #setMediaSessionsAPI(song) {
        navigator.mediaSession.metadata = await new MediaMetadata({
            title: song.getSongTitle(),
            artist: song.getSongArtistString(),
            album: "Album",
            artwork: [
                { src: song.getSongImageUrl() }
            ]
        });
    
        //TODO sometimes the information is not updated - NO IDEA WHY ..........
    
        
        navigator.mediaSession.setActionHandler('previoustrack', async function () {
            this.#playerHtmlController.prevSongButton();
            await setTimeout(function(){
            }, 100);
        });
        navigator.mediaSession.setActionHandler('nexttrack', async function () {
            await this.playNextSong();
            await setTimeout(function(){
            }, 100);
        });
    }

    async createNewNotification(song) {
        data = {
            title: song.getSongTitle(),
            subTitle: song.getSongArtistString(),
            body: song.getAlbumName(),
            imageUrl: song.getSongImageUrl()
        }
    
        sendNotification(data)
    }

    #setSpecificProgress(progress) {
        this.#playerHtmlController.setSliderValue(progress);
    }

    #setAudioSource(source) {
        this.#playerHtmlController.setAudioSource(source);
    }

    #setSpecificVolume(volume) {
        this.#playerHtmlController.setVolume(volume);
    }

    setPlayState(state) {
        this.#playState = state
        this.#playerHtmlController.setPlayState(state);
        this.#playerHtmlController.setPlayIcon(state);
    }

    setShuffleState(state) {
        this.#shuffleState = state
    }

    setRepeatState(state) {
        this.#repeatState = state
    }

    #setPlayerImage(src) {
        this.#playerHtmlController.setPlayerSongImage(src);
    }

    #setPlayerInfo(song) {
        const TITLE = song.getSongTitle();
        const ARTIST = song.getSongArtistString();

        const INFO = TITLE + " - " + ARTIST;

        this.#playerHtmlController.setPlayerTitle(INFO);
    }

    getPlayState() {
        return this.#playState;
    }

    playLastSong() {
        const lastSong = this.#queue.getLastSong();
        this.#play(lastSong);
    }

    playNextSong() {
        const nextSong = this.#queue.getNextSong();
        this.#play(nextSong);
    }
    
    getShuffleState() {
        return this.#shuffleState;
    }

    setShuffleState(state) {
        this.#shuffleState = state;
        this.#queue.setShuffleState(state);
        console.log(this.#shuffleState);
    }

    getRepeatState() {
        return this.#repeatState;
    }

    setRepeatState(state) {
        this.#repeatState = state;
        this.#queue.setRepeatState(state);
        console.log(this.#repeatState);
    }
}