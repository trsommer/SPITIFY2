class DownloadView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #downloadedSongs = null; //the last searches
    #htmlDownloadedSongs = [];
    #displayed = false
    #viewController = null

    constructor(data, viewController) {
        super();
        return this.#constructorMethod(data, viewController);
    }

    //implemeneted methods

    /**
     * This method fetches the users last Searches from a database and creates the last seraches view for them.
     * @param {Object} data - The data to be used for the construction. (useless here)
     */
    async #constructorMethod(data, viewController) {
        const downloadedSongs = await this.#getDownloadedSongs();
        await this.#createView(downloadedSongs, viewController);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show() {
        const viewPort = document.getElementById('viewport');
        viewPort.appendChild(this.#viewHTML);
        this.#displayed = true
    }

    /**
     * Clears the viewport.
     */
    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        this.#displayed = false
    }

    /**
     * Creates a view with the given type and data.
     * 
     * @async
     * @param {Object} data - The data to use in the view.
     */
    async #createView(data, viewController) {
        this.#downloadedSongs = data;
        this.#type = "downloads_view";
        this.#viewController = viewController;
        
        const returnValues = this.createHTMLContainer('Your Downloads', 'downloads_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        await this.#spawnDownloadedSongs(data, returnValues.contentContainer);

    }

    async updateView() {
        //not used here
    }

    getHTMLContainer() {
        return this.#viewHTML;
    }

    /**
     * Returns the HTML content container for the current view.
     *
     * @returns {HTMLElement} The HTML content container.
     */
    getHTMLContentContainer() {
        return this.#viewHTML;
    }

    /**
     * Returns the type of view.
     *
     * @returns {string} The type of view.
     */
    getType() {
        return this.#type;
    }

    //downloads specific methods

    async #getDownloadedSongs() {
        const songIds = await getDownloadIdsFromDB();
        const songs = await getDownloadedSongs(songIds);

        return songs;
    }

    async #spawnDownloadedSongs(songs, contentContainer) {
        for (let i = 0; i < songs.length; i++) {
            const song = songs[i];
            const songInfo =  JSON.parse(song.info);
            const songId = song.id;
            const songImageUrl = songInfo.songImageUrl;
            const songTitle = songInfo.songTitle;
            const artistsText = getArtistsAsString(JSON.parse(songInfo.songArtistArray).items);

            await this.#addHTMLSong(songId, songImageUrl, songTitle, artistsText, contentContainer, 0, 0, song.id);
        }
    }

    async downloadSong(song) {
        const songTitle = song.getSongTitle();
        const songArtist = song.getSongArtistString();
        const songImageUrl = song.getSongImageUrl();
        const songId = song.getSongSpotifyId();
        const index = downloadedSongInfo.length;
        downloadedSongInfo.push(song);

        await this.#addHTMLSong(songId, songImageUrl, songTitle, songArtist, this.#HTMLContent, 0, index, songId);
    }

    updateDownloadProgress(songId, progress) {
        const songHTMLPointer = this.#htmlDownloadedSongs[songId];
        const progressElem = songHTMLPointer.trackProgress;
        const progressFloat = parseFloat(progress.toFixed(2));

        if (progressFloat >= 99) {
            progressElem.innerHTML = "done";
        } else {
            progressElem.innerHTML = parseFloat(progress.toFixed(2)) + "%";
        }
    }

    purgeDownloadsHTML() {
        const contentContainer = this.#HTMLContent;
        contentContainer.innerHTML = "";
    }

    async #playDownloadedSong(id) {
        const songInfoJSON = this.#downloadedSongs.find(song => song.id === id);
        const songInfo = JSON.parse(songInfoJSON.info);
        const originalSongInfo = songInfo.songInfo;

        playSongNow(originalSongInfo)
    }



    //html creation methods

    #addHTMLSong(songId, songImageUrl, songTitle, artistsText, contentContainer, progress, index, id) {
        const track = document.createElement('div');
        track.classList.add('track_item');

        const trackImageSpacer = document.createElement('div');
        trackImageSpacer.classList.add('track_spacer_left');

        const trackImageContainer = document.createElement('div');
        trackImageContainer.classList.add('track_image_container');

        const trackImage = document.createElement('img');
        trackImage.classList.add('track_image');
        trackImage.src = songImageUrl;

        const currentlyPlayingContainer = document.createElement("div");
        currentlyPlayingContainer.classList.add("currently_playing_container");
        currentlyPlayingContainer.classList.add("playlist_currently_playing_container")

        const currentlyPlayingBackground = document.createElement("div");
        currentlyPlayingBackground.classList.add("currently_playing_background");

        const currentlyPlayingImage = document.createElement("img");
        currentlyPlayingImage.classList.add("currently_playing_svg");
        currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

        currentlyPlayingContainer.appendChild(currentlyPlayingBackground)
        currentlyPlayingContainer.appendChild(currentlyPlayingImage)

        trackImageContainer.appendChild(trackImage)
        trackImageContainer.appendChild(currentlyPlayingContainer)

        const trackName = document.createElement('p');
        trackName.classList.add('track_text_left');
        trackName.innerText = songTitle;

        const trackArtist = document.createElement('p');
        trackArtist.classList.add('track_text_middle');
        trackArtist.innerText = artistsText;

        const trackProgress = document.createElement('p');
        trackProgress.classList.add('track_text_right');
        trackProgress.innerText = progress;

        track.appendChild(trackImageSpacer);
        track.appendChild(trackImageContainer);
        track.appendChild(trackName);
        track.appendChild(trackArtist);
        track.appendChild(trackProgress);

        const that = this;

        track.addEventListener("click", function () {
            that.#playDownloadedSong(songId);
        });

        contentContainer.appendChild(track);
        this.#htmlDownloadedSongs[songId] = {
            track: track,
            trackProgress: trackProgress,
            currentlyPlayingContainer: currentlyPlayingContainer
        };
    }

}