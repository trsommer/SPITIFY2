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
        const DOWNLOADED_SONGS = await getDownloadedSongs();
        await this.#createView(DOWNLOADED_SONGS, viewController);
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
        
        const RETURN_VALUES = this.createHTMLContainer('Your Downloads', 'downloads_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        await this.#spawnDownloadedSongs(data, RETURN_VALUES.contentContainer);

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
        const SONG_IDS = await getDownloadIdsFromDB();
        const SONGS = await getDownloadedSongs(SONG_IDS);

        return SONGS;
    }

    async #spawnDownloadedSongs(songs, contentContainer) {
        for (let i = 0; i < songs.length; i++) {
            const SONG = songs[i];
            const SONG_INFO =  JSON.parse(SONG.info);
            const SONG_ID = SONG.id;
            const SONG_IMAGE_URL = SONG_INFO.songImageUrl;
            const SONG_TITLE = SONG_INFO.songTitle;
            const ARITIST_TEXT = getArtistsAsString(JSON.parse(SONG_INFO.songArtistArray).items);

            await this.#addHTMLSong(SONG_ID, SONG_IMAGE_URL, SONG_TITLE, ARITIST_TEXT, contentContainer, 0, 0, SONG.id);
        }
    }

    async downloadSong(song) {
        const SONG_TITLE = song.getSongTitle();
        const SONG_ARTIST = song.getSongArtistString();
        const SONG_IMAGE_URL = song.getSongImageUrl();
        const SONG_ID = song.getSongSpotifyId();
        const INDEX = downloadedSongInfo.length;
        downloadedSongInfo.push(song);

        await this.#addHTMLSong(SONG_ID, SONG_IMAGE_URL, SONG_TITLE, SONG_ARTIST, this.#HTMLContent, 0, INDEX, SONG_ID);
    }

    updateDownloadProgress(songId, progress) {
        const SONG_HTML_POINTER = this.#htmlDownloadedSongs[songId];
        const PROGRESS_ELEM = SONG_HTML_POINTER.trackProgress;
        const PROGRESS_FLOAT = parseFloat(progress.toFixed(2));

        if (PROGRESS_FLOAT >= 99) {
            PROGRESS_ELEM.innerHTML = "done";
        } else {
            PROGRESS_ELEM.innerHTML = parseFloat(progress.toFixed(2)) + "%";
        }
    }

    purgeDownloadsHTML() {
        const CONTENT_CONTAINER = this.#HTMLContent;
        CONTENT_CONTAINER.innerHTML = "";
    }

    async #playDownloadedSong(id) {
        const SONG_INFO_JSON = this.#downloadedSongs.find(song => song.id === id);
        const SONG_INFO = JSON.parse(SONG_INFO_JSON.info);
        const ORIGINAL_SONG_INFO = SONG_INFO.songInfo;

        playSongNow(ORIGINAL_SONG_INFO)
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