class Song {
    #name
    #artists = []
    #imageCoverUrl
    #url = ""
    #playstate = false
    #length = 0
    
    constructor(songInfo) {
        this.#setInfo(songInfo)
        this.#setURL()
    }

    #setInfo(songInfo) {
        this.#name = songInfo["name"]
        var artistsArray = songInfo["artists"]["items"]
        for (let i = 0; i < artistsArray.length; i++) {
            var artist = artistsArray[i.toString()]
            var artistObj = new Artist(artist["profile"]["name"], artist["uri"])
            this.#artists[i] = artistObj
        }
        this.#imageCoverUrl = songInfo["album"]["coverArt"]["sources"][0]['url']

        console.log(this.#imageCoverUrl);

    }

    async #setURL() {
        var title = this.#name + " by " + this.getArtistsAsString()

        console.log(title)

        var response = await getYoutubeUrl(title)
        console.log(response)
        var url = response["0"]["url"]
        var streamingUrl = await getStreamingUrl(url)

        this.#url = streamingUrl

        console.log(this.#url)

        if (this.#playstate) {
            this.play()
        }

    }

    #timeConvert(ms) {
        var seconds = Math.floor(ms/1000)
    
        //seconds to minutes
        var minutes = Math.floor(seconds/60)
        var remainingSeconds = seconds % 60
    
        var remainingSecondsString = "" + remainingSeconds
    
        if (remainingSeconds.toString().length == 1) {
            remainingSecondsString = "0" + remainingSeconds
        }
    
        return "" + minutes + ":" + remainingSecondsString
    }

    getArtistsAsString() {
        if (this.#artists == []) {
            return null
        }

        var returnString = ""

        for (let i = 0; i < this.#artists.length; i++) {
            const artist = this.#artists[i];
            if (i == 0) {
                returnString = artist.getName()
            } else {
                returnString += ", " + artist.getName()
            }
        }

        return returnString
    }

    setUrl(url) {
        this.#url = url
    }

    getName() {
        return this.#name
    }

    getArtists() {
        return this.#artists
    }

    getUrl() {
        return this.#url
    }

    getImageCoverUrl() {
        return this.#imageCoverUrl
    }

    getLength() {
        return this.#length
    }

    addToQueue() {
        addToQueue(this)
    }

    play() {
        console.log("play");
        if (this.#url != "") {
            var audio = document.getElementById("menu_player_audio")

            audio.src = this.#url
            this.addToPlayer()
            changePlayState()
            sendNotification(this.#name, this.getArtistsAsString)
        } else {
            this.#playstate = true
        }
        
    }

    addToPlayer() {
        var playerImage = document.getElementById('menu_player_cover')
        playerImage.src = this.#imageCoverUrl
    }
}