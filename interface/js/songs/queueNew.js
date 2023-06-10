class Queue {
    #playedQueue = [];
    #currentSong = null;
    #songQueue = [];
    #viewController = null
    #player = null

    constructor(player, viewController) {
        this.#player = player;
        player.registerQueue(this);
        this.#viewController = viewController;
    }

    getNextSong() {
        if (this.#songQueue.length == 0 && this.#currentSong == null) {
            return null;
        }
        
        return this.#currentSong;
    } 

    async enqueue(songInfo) {
        const song = await new SongNew(songInfo);
        await this.enqueueSong(song);
    }


    async enqueueSong(song) {
        if (this.#currentSong == null) {
            this.#currentSong = song;
            return
        }
        this.#songQueue.push(song);
    }

    async prioritize(songInfo) {
        const song = await new SongNew(songInfo); 
        await this.prioritizeSong(song);
    }

    async prioritizeSong(song) {
        if (this.#currentSong == null) {
            this.#currentSong = song;
            return
        }

        this.#songQueue.unshift(song);
    }

    async skipQueue(songInfo) {
        const song = await new SongNew(songInfo);
        return thisskipQueueSong(song);
    }

    async skipQueueSong(song) {
        if (this.#currentSong == null) {
            this.#currentSong = song;
            return;
        }

        const lastSong = this.#currentSong;
        this.#playedQueue.unshift(lastSong);
        this.#currentSong = song;
    }

    async replaceQueue(songInfo) {
        const song = await new SongNew(songInfo);
    }

    async replaceQueueSong(song) {
        if (this.#currentSong == null) {
            this.#currentSong = song;
            return;
        }

        this.#songQueue = [song];
    }

    clearQueue() {
        this.#songQueue = [];
    }

    clearCurrentlyPlaying() {
        this.#currentSong = null;
    }

    clearAll() {
        this.clearCurrentlyPlaying();
        this.clearQueue();
    }

    getQueueLength() {
        return this.#songQueue.length;
    }

    getCurrentSong() {
        return this.#currentSong;
    }

    getSongQueue() {
        return this.#songQueue;
    }

    getPlayedQueue() {
        return this.#playedQueue;
    }

}