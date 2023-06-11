class Player {
    #viewController = null
    #playState = false
    #shuffleState = false
    #repeatState = 0
    #playerHtmlController = null;
    #queue = null

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
    async play() {
        const nextSong = this.#queue.getNextSong();

        this.#setPlayerImage(nextSong.getSongImageUrl());
        this.#setSpecificProgress(0);
        this.#setAudioSource(nextSong.getSongStreamingUrl());
        this.#setSpecificVolume(nextSong.getSongPreferredVolume());
        this.setPlayState(true);
    }

    async addSongToPlayer() {
        const nextSong = this.#queue.getNextSong();
        
    }

    async pause() {

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

    getPlayState() {
        return this.#playState;
    }
    
}