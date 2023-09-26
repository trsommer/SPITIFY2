class SongNew {
  #params = null

  constructor(info, type) {
    return this.#constructorFunction(info, type)
  }

  async #constructorFunction(info, type) {
    await this.#setup(info, type)
    return this
  }

  async #setup(info, type) {
    const response = await generateSong(info)
    this.#params = response
  }

  getSongId() {
    return this.#params.songSpotifyId
  }

  getSongTitle() {
    return this.#params.songTitle
  }

  getSongArtistArray() {
    return this.#params.songArtistArray
  }

  getSongArtistString() {
    return getArtistsAsString(this.#params.songArtistArray)
  }

  getSongType() {
    return this.#params.songType
  }

  getSongAlbum() {
    return this.#params.songAlbum
  }

  getSongImageUrl() {
    return this.#params.songImageUrl
  }

  getSongDuration() {
    return this.#params.songDuration
  }

  getSongStreamingUrl() {
    return this.#params.songStreamingUrl
  }

  getSongLocalLocation() {
    return this.#params.songLocalLocation
  }

  getSongYoutubeId() {
    return this.#params.songYoutubeId
  }

  getSongLikeStatus() {
    return this.#params.songLikeStatus
  }

  getSongPreferredVolume() {
    return this.#params.songPreferredVolume
  }

  getSongInfo() {
    return this.#params.songInfo
  }
}
