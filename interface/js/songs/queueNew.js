class Queue {
  #playedQueue = []
  #currentSong = null
  #songQueue = []
  #songQueueShuffled = []
  #viewController = null
  #player = null
  #shuffleState = false
  #repeatState = 0

  constructor(player, viewController) {
    this.#player = player
    player.registerQueue(this)
    this.#viewController = viewController
  }

  getNextSong() {
    if (this.#repeatState != 0) return this.#getNextSongRepeat(this.#repeatState)
    if (this.#shuffleState) return this.#getNextSongShuffle()
    if (this.#songQueue.length == 0) {
      return null
    }

    if (this.#currentSong != null) {
      this.#playedQueue.push(this.#currentSong)
    }

    this.#currentSong = this.#songQueue.shift()

    return this.#currentSong
  }

  #getNextSongRepeat() {
    const state = this.#repeatState //has to be 1 (repeat all) or 2 (repeat one)

    if (state == 1) {
      //repeat all
      if (this.#currentSong == null && this.#songQueue.length == 0) {
        return null
      }
      const lastSong = this.#currentSong

      if (this.#shuffleState) {
        this.#songQueueShuffled.push(lastSong)
        this.#currentSong = this.#songQueueShuffled.shift()
        return this.#currentSong
      }
      this.#songQueue.push(lastSong)
      this.#currentSong = this.#songQueue.shift()
      return this.#currentSong
    } else {
      //repeat the current song until repeat state is changed
      if (this.#currentSong == null && this.#songQueue.length == 0) {
        //no songs to be played
        return null
      }
      if (this.#currentSong == null) {
        //no song is playing but there are songs in the queue
        this.#currentSong = this.#songQueue.shift()
      }
      return this.#currentSong
    }
  }

  #getNextSongShuffle() {
    if (this.#songQueueShuffled.length == 0 && this.#songQueue.length == 0) {
      //no songs to be played
      return null
    }
    if (this.#songQueueShuffled.length == 0) {
      //no songs in the shuffled queue (this cant happen)
      this.shuffleSongQueue()
    }

    if (this.#currentSong != null) {
      this.#playedQueue.push(this.#currentSong)
    }

    this.#currentSong = this.#songQueueShuffled.shift()
    return this.#currentSong
  }

  #shuffleSongQueue() {
    this.#songQueueShuffled = this.#songQueue
    this.#songQueueShuffled.sort(() => Math.random() - 0.5)
  }

  getLastSong() {
    if (this.#playedQueue.length == 0) {
      return null
    }

    const lastSong = this.#playedQueue.pop()

    if (this.#currentSong != null) {
      const currentSong = this.#currentSong
      this.#songQueue.unshift(currentSong)
    }

    this.#currentSong = lastSong

    console.log(this.#playedQueue)
    console.log(this.#currentSong)
    console.log(this.#songQueue)

    return lastSong
  }

  async enqueue(songInfo) {
    const song = await new SongNew(songInfo)
    await this.enqueueSong(song)
  }

  async enqueueSong(song) {
    this.#songQueue.push(song)
  }

  async prioritize(songInfo) {
    const song = await new SongNew(songInfo)
    await this.prioritizeSong(song)
  }

  async prioritizeSong(song) {
    this.#songQueue.unshift(song)
  }

  async skipQueue(songInfo) {
    const song = await new SongNew(songInfo)
    return this.skipQueueSong(song)
  }

  async skipQueueSong(song) {
    const lastSong = this.#currentSong
    this.#playedQueue.unshift(lastSong)
    this.#currentSong = song
  }

  async replaceQueue(songInfo) {
    const song = await new SongNew(songInfo)
  }

  async replaceQueueSong(song) {
    if (this.#currentSong == null) {
      this.#currentSong = song
      return
    }

    this.#songQueue = [song]
  }

  clearQueue() {
    this.#songQueue = []
  }

  clearCurrentlyPlaying() {
    this.#currentSong = null
  }

  clearAll() {
    this.clearCurrentlyPlaying()
    this.clearQueue()
  }

  getQueueLength() {
    return this.#songQueue.length
  }

  getCurrentSong() {
    return this.#currentSong
  }

  getSongQueue() {
    return this.#songQueue
  }

  getPlayedQueue() {
    return this.#playedQueue
  }

  getShuffleState() {
    return this.#shuffleState
  }

  getRepeatState() {
    return this.#repeatState
  }

  setShuffleState(state) {
    this.#shuffleState = state
    if (state) {
      this.#shuffleSongQueue()
    }
  }

  setRepeatState(state) {
    this.#repeatState = state
  }
}
