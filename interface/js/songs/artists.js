class Artist {
    #name
    #spotifyURI

    constructor(name, uri) {
        this.#name = name
        this.#spotifyURI = uri
    }

    getName() {
        return this.#name
    }

    getURI() {
        return this.#spotifyURI
    }
}