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
        if (this.#songQueue.length == 0) {
            return null;
        }

        if (this.#currentSong != null) {
            this.#playedQueue.push(this.#currentSong);
        }

        this.#currentSong = this.#songQueue.shift();

        return this.#currentSong
    }

    getLastSong() {
        if (this.#playedQueue.length == 0) {
            return null;
        }

        const lastSong = this.#playedQueue.pop();

        if (this.#currentSong != null) {
            const currentSong = this.#currentSong;
            this.#songQueue.unshift(currentSong);
        }

        this.#currentSong = lastSong;

        console.log(this.#playedQueue);
        console.log(this.#currentSong);
        console.log(this.#songQueue);


        return lastSong;
    }

    async enqueue(songInfo) {
        const song = await new SongNew(songInfo);
        await this.enqueueSong(song);
    }


    async enqueueSong(song) {
        this.#songQueue.push(song);
    }

    async prioritize(songInfo) {
        const song = await new SongNew(songInfo); 
        await this.prioritizeSong(song);
    }

    async prioritizeSong(song) {
        this.#songQueue.unshift(song);
    }

    async skipQueue(songInfo) {
        const song = await new SongNew(songInfo);
        return this.skipQueueSong(song);
    }

    async skipQueueSong(song) {
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