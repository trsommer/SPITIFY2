class PlaylistView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #viewController = null
    #playlistData = null

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
        await this.#createView(data, viewController);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show() {
        const viewPort = document.getElementById('viewport');
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
        this.#playlistData = data;
        this.#viewController = viewController;
        this.#type = "playlist_view";
        
        const returnValues = this.createHTMLContainer('unbound', 'playlist_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        console.log(data);
        this.#createHeader(returnValues.contentContainer, data);
        this.#createPlaylistSongsContainer(returnValues.contentContainer, data);
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

    //last searches specific methods



    //html creation methods

    #createHeader(contentContainer, data) {
        const name = data.playlistInfo.name;
        const author = data.playlistInfo.author;
        const imageContainers = this.#createPlaylistImageContainers(data);
        
        const headerContainer = document.createElement('div');
        headerContainer.setAttribute('id', 'playlist_header_container');

        const backgroundImageContainer = imageContainers.backgroundImageContainer;

        const backgroundImageGradient = document.createElement('div');
        backgroundImageGradient.setAttribute('id', 'playlist_background_image_gradient');

        backgroundImageContainer.appendChild(backgroundImageGradient);

        const foregroundImageContainer = imageContainers.imageContainer;

        const textContainer = document.createElement('div');
        textContainer.setAttribute('id', 'playlist_text_container');

        const nameText = document.createElement('h2');
        nameText.setAttribute('id', 'playlist_name_text');
        nameText.innerHTML = name;

        const autorText = document.createElement('p');
        autorText.setAttribute('id', 'playlist_author_text');
        autorText.innerHTML = "by " + author;

        textContainer.appendChild(nameText);
        textContainer.appendChild(autorText);

        headerContainer.appendChild(backgroundImageContainer);
        headerContainer.appendChild(foregroundImageContainer);
        headerContainer.appendChild(textContainer);

        contentContainer.appendChild(headerContainer);
    }

    #createPlaylistImageContainers(data) {
        const playlistImageUrls = data.playlistInfo.imageUrl;
        const playlistImageArray = playlistImageUrls.split(',');
        const songsData = data.songs;

        if (songsData.length >= 4) {
            return this.#createQuadImageContainers(data);
        }

        if (playlistImageArray.length == 4) {
            //update imageUrls
        }

        const playlistImageUrl = data.playlistInfo.imageUrl;

        const imageContainer = document.createElement('div');
        imageContainer.setAttribute('id', 'playlist_image_container');

        const image = document.createElement('img');
        image.setAttribute('id', 'playlist_image');
        image.src = playlistImageUrl;

        imageContainer.appendChild(image);

        
        const backgroundImageContainer = document.createElement('div');
        backgroundImageContainer.setAttribute('id', 'playlist_background_image_container');
        
        const backgroundImage = document.createElement('img');
        backgroundImage.setAttribute('id', 'playlist_background_image');
        backgroundImage.src = playlistImageUrls;

        backgroundImageContainer.appendChild(backgroundImage);

        return {
            imageContainer: imageContainer,
            backgroundImageContainer: backgroundImageContainer
        }
    }

    #createQuadImageContainers(data) {
        let playlistImageUrls = data.playlistInfo.imageUrl;
        const playlistImageArray = playlistImageUrls.split(',');
        const songsData = data.songs;

        if (playlistImageArray.length == 4) {
            //update images
        }

        const playlistQuadImageContainer = document.createElement('div');
        playlistImageContainer.setAttribute('id', 'playlist_quad_image_container');
        

        const plalistQuadImageBackgroundContainer = document.createElement('div');
        plalistQuadImageBackgroundContainer.setAttribute('id', 'playlist_quad_image_background_container');

        for (let i = 0; i < 4; i++) {
            const SongData = songsData[i];
            const songInfo = JSON.parse(SongData.info);
            const songImageUrl = songInfo.songImageUrl;

            const songImage = document.createElement('img');
            songImage.setAttribute('class', 'playlist_quad_image');
            songImage.src = songImageUrl
            
            const songImageBackground = document.createElement('img');
            songImageBackground.setAttribute('class', 'playlist_quad_image_background');
            songImageBackground.src = playlistImageUrls;

            playlistQuadImageContainer.appendChild(songImage);
            plalistQuadImageBackgroundContainer.appendChild(songImageBackground);
        }

        return {
            imageContainer: playlistQuadImageContainer,
            backgroundImageContainer: plalistQuadImageBackgroundContainer
        }
    }

    #createPlaylistSongsContainer(contentContainer, data) {
        const songsData = data.songs;

        const playlistSongsContainer = document.createElement('div');
        playlistSongsContainer.setAttribute('id', 'playlist_songs_container');
        playlistSongsContainer.setAttribute('class', 'tracks_container');

        for (let i = 0; i < songsData.length; i++) {
            const songData = songsData[i];
            const songInfo = JSON.parse(songData.info);
            const songName = songInfo.songTitle;
            const songArtistArray = JSON.parse(songInfo.songArtistArray);
            const songArtistString = getArtistsAsString(songArtistArray.items)
            const songImageUrl = songInfo.songImageUrl;
            const songDuration = songInfo.songDuration;
            const durationString = getTrackLengthFromMS(songDuration)

            const trackItem = document.createElement('div');
            trackItem.setAttribute('class', 'track_item');

            const trackSpacerLeft = document.createElement('div');
            trackSpacerLeft.setAttribute('class', 'track_spacer_left');

            const trackImageContainer = document.createElement('div');
            trackImageContainer.setAttribute('class', 'track_image_container');

            const trackImage = document.createElement('img');
            trackImage.setAttribute('class', 'track_image');
            trackImage.src = songImageUrl;

            const songNameHTML = document.createElement('p');
            songNameHTML.setAttribute('class', 'track_text_left');
            songNameHTML.innerHTML = songName;

            const songArtistHTML = document.createElement('p');
            songArtistHTML.setAttribute('class', 'track_text_middle');
            songArtistHTML.innerHTML = songArtistString;

            const songDurationHTML = document.createElement('p');
            songDurationHTML.setAttribute('class', 'track_text_right');
            songDurationHTML.innerHTML = durationString;

            trackImageContainer.appendChild(trackImage);

            trackItem.appendChild(trackSpacerLeft);
            trackItem.appendChild(trackImageContainer);
            trackItem.appendChild(songNameHTML);
            trackItem.appendChild(songArtistHTML);
            trackItem.appendChild(songDurationHTML);

            playlistSongsContainer.appendChild(trackItem);
        }

        contentContainer.appendChild(playlistSongsContainer);
    }

}