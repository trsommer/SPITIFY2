class AlbumView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #viewController = null
    #albumData = null
    #messageBroker = null

    constructor(data, viewController) {
        super();
        return this.#constructorMethod(data, viewController);
    }

    //implemeneted methods

    /**
     * if (typeof myVar === 'string' || myVar instanceof String)
     * This method fetches the users last Searches from a database and creates the last seraches view for them.
     * @param {Object} data - The data to be used for the construction. (useless here)
     */
    async #constructorMethod(data, viewController) {
        let albumID = null; 
        if (this.#checkIfId(data)) {
            albumID = data;
        } else {
            albumID = data.uri.split(':')[2];
        }
        const ALBUM_DATA = await getSpotifyAlbum(albumID);
        const ALBUM_METADATA = await getAlbumMetadata(albumID);
        const ALBUM_COMBINED_DATA = {
            metadata : ALBUM_METADATA,
            songs : ALBUM_DATA.data.album.tracks.items
        }
        await this.#createView(ALBUM_COMBINED_DATA, viewController);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show() {
        const viewPort = document.getElementById('viewport');
        const that = this;
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
        this.#displayed = true;
        
    }

    /**
     * Clears the viewport.
     */
    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        this.#displayed = false;
    }

    /**
     * Creates a view with the given type and data.
     * 
     * @async
     * @param {Object} data - The data to use in the view.
     */
    async #createView(data, viewController) {
        console.log(data);
        this.#albumData = data;
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#type = "album_view";
        
        const returnValues = this.createHTMLContainer('unbound', 'album_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        this.#addLastSearch(data)
        this.#createHeader(returnValues.contentContainer, data);
        this.#createAlbumSongsContainer(returnValues.contentContainer, data);
    }

    async updateView() {
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

    //playlist specific methods

    #checkIfId(data) {
        if (typeof data === 'string' || data instanceof String) {
            return true;
        }
        return false;
    }

    #createAlbumInfoString(songs) {
        let duration = 0;
        let nrSongs = 0;
        for (let i = 0; i < songs.length; i++) {
            const SONG = songs[i];
            const SONG_INFO = SONG.track;
            const DURATION_MS = SONG_INFO.duration.totalMilliseconds;
            duration += DURATION_MS;
            nrSongs++;
            
        }

        const DURATION_STRING = msToTimeString(duration);
        return `${nrSongs} songs, ${DURATION_STRING}`;
    }

    #isoTimeToYearString(isoTime) {
        //"2015-10-20T00:00:00Z"
        const DATE = isoTime.split('T')[0];
        const DATE_PARTS = DATE.split('-');

        return DATE_PARTS[0];
    }

    //html creation methods

    #createHeader(contentContainer, data) {
        const NAME = data.metadata.name;
        const ARTISTS = data.metadata.artists.items;
        const ARTIST_STRING = getArtistsAsString(ARTISTS);
        const IMAGE_URL = data.metadata.coverArt.sources[0]?.url || "standardImages/cover.jpg";
        const PLAYLIST_INFO_STRING = this.#createAlbumInfoString(data.songs);
        const ISO_RELEASE_TIME = data.metadata.date.isoString;
        const YEAR_STRING = this.#isoTimeToYearString(ISO_RELEASE_TIME);
        const buttonContainer = this.#createButtonContainer();

        const headerContainer = document.createElement('div');
        headerContainer.setAttribute('id', 'album_header_container');

        const backgroundImageContainer = document.createElement('div');
        backgroundImageContainer.setAttribute('id', 'album_background_image_container');

        const backgroundImage = document.createElement('img');
        backgroundImage.setAttribute('id', 'album_background_image');
        backgroundImage.src = IMAGE_URL;

        const backgroundImageGradient = document.createElement('div');
        backgroundImageGradient.setAttribute('id', 'playlist_background_image_gradient');
        
        const foregroundImageContainer = document.createElement('div');
        foregroundImageContainer.setAttribute('id', 'album_foreground_image_container');

        const foregroundImage = document.createElement('img');
        foregroundImage.setAttribute('id', 'album_foreground_image');
        foregroundImage.src = IMAGE_URL;

        const textContainer = document.createElement('div');
        textContainer.setAttribute('id', 'album_text_container');

        const nameText = document.createElement('h2');
        nameText.setAttribute('id', 'album_name_text');
        nameText.setAttribute('contenteditable', 'true');
        nameText.innerHTML = NAME;

        const autorTextContainer = document.createElement('div');
        autorTextContainer.setAttribute('id', 'album_author_text_container');

        const span1 = document.createElement('span');
        span1.innerHTML = "by ";
        autorTextContainer.appendChild(span1);

        for (let i = 0; i < ARTISTS.length; i++) {
            const ARTIST = ARTISTS[i];
            const ARTIST_NAME = ARTIST.profile.name;
            const ARTIST_ID = ARTIST.id;
            
            const span = document.createElement('span');
            span.style.textDecoration = "underline";
            span.className = 'album_author_text';
            span.innerHTML = ARTIST_NAME;
            span.addEventListener('click', () => {
                this.#viewController.switchView('artist', ARTIST_ID);
            });
            autorTextContainer.appendChild(span);
        }

        const span2 = document.createElement('span');
        span2.innerHTML = " • " + YEAR_STRING;
        autorTextContainer.appendChild(span2);

        const durationText = document.createElement('p');
        durationText.setAttribute('id', 'album_duration_text');
        durationText.innerHTML = PLAYLIST_INFO_STRING;

        backgroundImageContainer.appendChild(backgroundImage);
        backgroundImageContainer.appendChild(backgroundImageGradient);

        foregroundImageContainer.appendChild(foregroundImage);

        textContainer.appendChild(nameText);
        textContainer.appendChild(autorTextContainer);
        textContainer.appendChild(durationText);
        textContainer.appendChild(buttonContainer);

        headerContainer.appendChild(backgroundImageContainer);
        headerContainer.appendChild(foregroundImageContainer);
        headerContainer.appendChild(textContainer);

        contentContainer.appendChild(headerContainer);
    }

    #createAlbumSongsContainer(contentContainer, data) {
        const SONGS_DATA = data.songs;

        const albumSongsContainer = document.createElement('div');
        albumSongsContainer.setAttribute('id', 'album_songs_container');
        albumSongsContainer.setAttribute('class', 'tracks_container');

        for (let i = 0; i < SONGS_DATA.length; i++) {
            const SONG_INFO = SONGS_DATA[i].track;
            const SONG_NAME = SONG_INFO.name;
            const SONG_URI = SONG_INFO.uri;
            const SONG_ID = SONG_URI.split(':')[2];
            const SONG_ARTIST_ARRAY = SONG_INFO.artists;
            const SONG_ARTIST_STRING = getArtistsAsString(SONG_ARTIST_ARRAY.items)
            const SONG_IMAGE_URL = data.metadata.coverArt.sources[0]?.url || "standardImages/cover.jpg";
            const SONG_DURATION = SONG_INFO.duration.totalMilliseconds;
            const SONG_DURATION_STRING = getTrackLengthFromMS(SONG_DURATION)

            const trackItem = document.createElement('div');
            trackItem.setAttribute('class', 'track_item');
            trackItem.setAttribute("data-id", SONG_ID);

            const trackSpacerLeft = document.createElement('div');
            trackSpacerLeft.setAttribute('class', 'track_spacer_left');

            const trackImageContainer = document.createElement('div');
            trackImageContainer.setAttribute('class', 'track_image_container');

            const trackImage = document.createElement('img');
            trackImage.setAttribute('class', 'track_image');
            trackImage.src = SONG_IMAGE_URL;

            const songNameHTML = document.createElement('p');
            songNameHTML.setAttribute('class', 'track_text_left');
            songNameHTML.innerHTML = SONG_NAME;

            const songArtistHTML = document.createElement('p');
            songArtistHTML.setAttribute('class', 'track_text_middle');
            songArtistHTML.innerHTML = SONG_ARTIST_STRING;

            const songDurationHTML = document.createElement('p');
            songDurationHTML.setAttribute('class', 'track_text_right');
            songDurationHTML.innerHTML = SONG_DURATION_STRING;

            trackImageContainer.appendChild(trackImage);

            trackItem.appendChild(trackSpacerLeft);
            trackItem.appendChild(trackImageContainer);
            trackItem.appendChild(songNameHTML);
            trackItem.appendChild(songArtistHTML);
            trackItem.appendChild(songDurationHTML);

            trackItem.addEventListener('click', () => {
                this.#playNowTrackItem(SONG_INFO);
            })

            albumSongsContainer.appendChild(trackItem);
        }

        contentContainer.appendChild(albumSongsContainer);
    }

    #createButtonContainer() {
        const buttonContainer = document.createElement('div');
        buttonContainer.setAttribute('id', 'button_container');

        const playButtonContainer = document.createElement('div');
        playButtonContainer.setAttribute('class', 'playlist_button_container');

        const playButton = document.createElement('p');
        playButton.setAttribute('class', 'playlist_button');
        playButton.innerHTML = 'Play';

        const shuffleButtonContainer = document.createElement('div');
        shuffleButtonContainer.setAttribute('class', 'playlist_button_container');

        const shuffleButton = document.createElement('p');
        shuffleButton.setAttribute('class', 'playlist_button');
        shuffleButton.innerHTML = 'Shuffle';

        playButtonContainer.appendChild(playButton);
        shuffleButtonContainer.appendChild(shuffleButton);

        buttonContainer.appendChild(playButtonContainer);
        buttonContainer.appendChild(shuffleButtonContainer);

        return buttonContainer;
    }

    async #playNowTrackItem(songInfo) {
        const queue = this.#viewController.getQueue();
        const player = this.#viewController.getPlayer();
        await queue.enqueue(songInfo);
        player.playQueue();
    }

    #addLastSearch(data) {
        const LAST_SEARCH_DATA = {
            type: "album",
            id: data.metadata.uri.split(':')[2],
            name: data.metadata.name,
            imageUrl: data.metadata.coverArt.sources[0]?.url || "standardImages/cover.jpg",
            data: data.metadata
        }
        this.#messageBroker.publish("addLastSearch", LAST_SEARCH_DATA);
    }
}

