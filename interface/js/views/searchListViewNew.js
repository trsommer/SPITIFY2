class SearchListView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #data = null; //all of the users playlists as objects
    #displayed = false
    #viewController = null;
    #htmlHeadings = [];
    #htmlSelector = null;
    #selectedPosition = null;
    #lastPosition = null;
    #searchResultsContainer = null;
    #query = "";
    #searchResults = []
    #messageBroker = null;

    constructor(data, viewController) {
        super();
        return this.#constructorMethod(data, viewController);
    }

    //implemeneted methods

    /**
     * This method fetches the users playlists from a database and creates the playlist view for them.
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
        const DATA = this.#data
        const POSITION = this.#selectedPosition
        const that = this;
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
        this.#setSelectorPosition(POSITION, true);
        this.#displayed = true

        const SAVE_DATA = this.#loadSearchResults(POSITION);
        //check if data is already loaded
        if (!(SAVE_DATA)) {
            window.electronAPI.updateSpotifySpecificSerach((event, response) => {
                const DATA = response.data.searchV2;
                DATA.position = POSITION
                that.#saveSearchResults(DATA);
                that.#spawnSearchResults(DATA);
            });
        } else {
            SAVE_DATA.position = POSITION
            that.#spawnSearchResults(SAVE_DATA);
        }
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
        this.#data = data;
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#type = "searchlist_view";
        this.#selectedPosition = data.position;
        this.#query = data.query;

        const RETURN_VALUES = this.createHTMLContainer(null, 'searchlist_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        this.#setHeader(RETURN_VALUES.contentContainer, data);
        this.#selectView(data.position);
        this.#createSearchResultsContainer(RETURN_VALUES.contentContainer);
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
        return this.#HTMLContent;
    }

    /**
     * Returns the type of view.
     *
     * @returns {string} The type of view.
     */
    getType() {
        return this.#type;
    }

    //searchlist specific methods


    #openArtist(artistData) {
        this.#viewController.switchView('artist', artistData);
    }

    #openAlbum(albumData) {
        this.#viewController.switchView('album', albumData);
    }


    //HTML specific methods

    #setHeader(container, data) {
        const outerContainer = document.createElement('div');
        outerContainer.setAttribute('id', 'searchList_header_outer_container');

        const headerContainer = document.createElement('div');
        headerContainer.setAttribute('id', 'searchList_header_container');

        const artistHeader = document.createElement('div');
        artistHeader.setAttribute('class', 'searchList_header');
        artistHeader.innerHTML = 'Artists';
        artistHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition("Artists",false);
        });+
        artistHeader.addEventListener('click', () => {
            that.#selectView("Artists");
        });
        this.#htmlHeadings.Artists = artistHeader;
        const that = this;

        const songsHeader = document.createElement('div');
        songsHeader.setAttribute('class', 'searchList_header');
        songsHeader.innerHTML = 'Songs';
        songsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition("Tracks", false);
        });
        songsHeader.addEventListener('click', () => {
            that.#selectView("Tracks");
        });
        this.#htmlHeadings.Tracks = songsHeader;

        const albumsHeader = document.createElement('div');
        albumsHeader.setAttribute('class', 'searchList_header');
        albumsHeader.innerHTML = 'Albums';
        albumsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition("Albums", false);
        });
        albumsHeader.addEventListener('click', () => {
            that.#selectView("Albums");
        });
        this.#htmlHeadings.Albums = albumsHeader;

        const playlistsHeader = document.createElement('div');
        playlistsHeader.setAttribute('class', 'searchList_header');
        playlistsHeader.innerHTML = 'Playlists';
        playlistsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition("Playlists", false);
        });
        playlistsHeader.addEventListener('click', () => {
            that.#selectView("Playlists");
        });
        this.#htmlHeadings.Playlists = playlistsHeader;
        
        const headerSelector = document.createElement('div');
        headerSelector.setAttribute('id', 'searchList_header_selector');
        this.#htmlSelector = headerSelector;

        headerContainer.appendChild(artistHeader);
        headerContainer.appendChild(songsHeader);
        headerContainer.appendChild(albumsHeader);
        headerContainer.appendChild(playlistsHeader);

        outerContainer.appendChild(headerContainer);
        outerContainer.appendChild(headerSelector);

        container.appendChild(outerContainer);
    }

    #setSelectorPosition(position, state) {
        //state can be activte or passive
        //determines if the selector is clicked or hovered
        const SELECTOR = this.#htmlSelector;
        const SELECTOR_DIMS = this.#getSelectorDims(position);
        const LAST_POSITION = this.#lastPosition

        SELECTOR.style.width = SELECTOR_DIMS.width + 'px';
        SELECTOR.style.left = SELECTOR_DIMS.leftOffset + 'px';

        if (state) {
            SELECTOR.classList.add('searchList_header_selected_selector');
        } else {
            SELECTOR.classList.remove('searchList_header_selected_selector');
        }

        if (position != LAST_POSITION && state) {
            this.#htmlHeadings[LAST_POSITION].classList.remove('searchList_header_selected_text');
            this.#htmlHeadings[position].classList.add('searchList_header_selected_text');
        }
    }

    #getSelectorDims(position) {
        const HEADING_ELEM = this.#htmlHeadings[position];
        const OFFSET_LEFT = HEADING_ELEM.offsetLeft;
        const CLIENT_WIDTH = HEADING_ELEM.clientWidth;

        const SELECTOR_WIDTH = Math.floor(CLIENT_WIDTH * 0.8);
        const SELECTOR_LEFT_OFFSET = Math.floor(OFFSET_LEFT + (CLIENT_WIDTH - SELECTOR_WIDTH) / 2);

        return {
            width : SELECTOR_WIDTH,
            leftOffset : SELECTOR_LEFT_OFFSET
        }
    }

    #selectView(position) {
        const HEADING_ELEMENT = this.#htmlHeadings[position];
        const SELECTOR = this.#htmlSelector;
        const OLD_SELECTOR_POSITION = this.#selectedPosition;
        const OLD_HEADING_ELEMENT = this.#htmlHeadings[OLD_SELECTOR_POSITION];
        this.#selectedPosition = position;
        this.#lastPosition = OLD_SELECTOR_POSITION;
        const types = ['Artists', 'Tracks', 'Albums', 'Playlists'];

        HEADING_ELEMENT.classList.add('searchList_header_selected_text');
        SELECTOR.classList.add('searchList_header_selected_selector');

        if (HEADING_ELEMENT != OLD_HEADING_ELEMENT) {
            OLD_HEADING_ELEMENT.classList.remove('searchList_header_selected_text');

        }

        const OLD_SEARCH_RESULT = this.#loadSearchResults(position);

        if (OLD_SEARCH_RESULT != null) {
            this.#spawnSearchResults(OLD_SEARCH_RESULT);
        } else {
            this.#getData(this.#query, position, 100, 0);
        }
    }

    #getData(query, type, limit, offset) {
        getSpotifySearchResults(query, type, limit, offset)
    }

    #saveSearchResults(data) {
        const POSITION = this.#selectedPosition;
        this.#searchResults[POSITION] = data;
    }

    #loadSearchResults(position) {
        return this.#searchResults[position];
    }

    #createSearchResultsContainer(container) {
        const SEARCH_RESULTS_CONTAINER = document.createElement('div');
        SEARCH_RESULTS_CONTAINER.setAttribute('id', 'searchList_results_container');

        this.#searchResultsContainer = SEARCH_RESULTS_CONTAINER;

        container.appendChild(SEARCH_RESULTS_CONTAINER);
    }

    #spawnSearchResults(data) {
        const CONTENT_CONTAINER = this.#searchResultsContainer;

        if (data.artists) {
            this.#spawnArtistSearchResults(CONTENT_CONTAINER, data);
        } else if (data.tracksV2) {
            this.#spawnTrackSearchResults(CONTENT_CONTAINER, data);
        } else if (data.albums) {
            this.#spawnAlbumSearchResults(CONTENT_CONTAINER, data);
        } else if (data.searchV2) {
            this.#spawnPlaylistSearchResults(CONTENT_CONTAINER, data);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    #spawnArtistSearchResults(contentContainer, data) {
        contentContainer.innerHTML = '';
        const ARTISTS_DATA = data.artists.items;
        const that = this;
        
        const artistsContainer = document.createElement('div');
        artistsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(artistsContainer, contentContainer);

        for (let i = 0; i < ARTISTS_DATA.length; i++) {
            const ARTIST_DATA = ARTISTS_DATA[i].data;
            const ARTIST_IMAGE_URL = ARTIST_DATA.visuals.avatarImage?.sources[0].url || "standardImages/cover.jpg";
            const ARTIST_NAME = ARTIST_DATA.profile.name;
            const ARTIST_ID = ARTIST_DATA.id;

            const ARTIST_CONTAINER = this.#createTileElement(ARTIST_IMAGE_URL, ARTIST_NAME);

            //event listeners

            ARTIST_CONTAINER.addEventListener('click', () => {
                that.#openArtist(ARTIST_DATA);
            });

            artistsContainer.appendChild(ARTIST_CONTAINER);
        }

        contentContainer.appendChild(artistsContainer);

    }

    #spawnTrackSearchResults(contentContainer, data) {
        console.log(data);
        contentContainer.innerHTML = '';
        const SONGS_DATA = data.tracksV2.items;

        const songsContainer = document.createElement('div');
        songsContainer.setAttribute('id', 'searchList_songs_container');

        for (let i = 0; i < SONGS_DATA.length; i++) {
            const SONG_DATA = SONGS_DATA[i].item.data;
            const SONG_NAME = SONG_DATA.name;
            const ARTIST_STRING = getArtistsAsString(SONG_DATA.artists.items);
            const DURATION_MS = SONG_DATA.duration.totalMilliseconds;
            const DURATION_STRING = getTrackLengthFromMS(DURATION_MS);
            const IMAGE_URL = SONG_DATA.albumOfTrack.coverArt?.sources[0].url || "standardImages/cover.jpg";

            const trackItem = document.createElement('div');
            trackItem.setAttribute('class', 'track_item');

            const trackSpacerLeft = document.createElement('div');
            trackSpacerLeft.setAttribute('class', 'track_spacer_left');

            const trackImageContainer = document.createElement('div');
            trackImageContainer.setAttribute('class', 'track_image_container');

            const trackImage = document.createElement('img');
            trackImage.setAttribute('class', 'track_image');
            trackImage.src = IMAGE_URL;

            const currentlyPlayingContainer = document.createElement('div');
            currentlyPlayingContainer.setAttribute('class', 'currently_playing_container');

            const currentlyPlayingBG = document.createElement('div');
            currentlyPlayingBG.setAttribute('class', 'currently_playing_background');

            const currentlyPlayingSVG = document.createElement('img');
            currentlyPlayingSVG.setAttribute('class', 'currently_playing_svg');
            currentlyPlayingSVG.src = 'icons/spitifyAnimated.svg';

            const trackName = document.createElement('p');
            trackName.setAttribute('class', 'track_text_left');
            trackName.innerHTML = SONG_NAME;

            const trackArtists = document.createElement('p');
            trackArtists.setAttribute('class', 'track_text_middle');
            trackArtists.innerHTML = ARTIST_STRING;

            const trackLength = document.createElement('p');
            trackLength.setAttribute('class', 'track_text_right');
            trackLength.innerHTML = DURATION_STRING;

            currentlyPlayingContainer.appendChild(currentlyPlayingBG);
            currentlyPlayingContainer.appendChild(currentlyPlayingSVG);

            trackImageContainer.appendChild(trackImage);
            trackImageContainer.appendChild(currentlyPlayingContainer);

            trackItem.appendChild(trackSpacerLeft);
            trackItem.appendChild(trackImageContainer);
            trackItem.appendChild(trackName);
            trackItem.appendChild(trackArtists);
            trackItem.appendChild(trackLength);

            songsContainer.appendChild(trackItem);
        }

        contentContainer.appendChild(songsContainer);
    }

    #spawnAlbumSearchResults(contentContainer, data) {
        contentContainer.innerHTML = '';
        const ALBUMS_DATA = data.albums.items;
        const that = this;

        const albumsContainer = document.createElement('div');
        albumsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(albumsContainer, contentContainer);

        for (let i = 0; i < ALBUMS_DATA.length; i++) {
            const ALBUM_DATA = ALBUMS_DATA[i].data;
            const ALBUM_NAME = ALBUM_DATA.name;
            const ALBUM_NAME_SHORT = shortenString(ALBUM_NAME, 20);
            const ALBUM_IMAGE_URL = ALBUM_DATA.coverArt?.sources[0].url || "standardImages/cover.jpg";
            const ALBUM_URI = ALBUM_DATA.uri;
            const ALBUM_ID = ALBUM_URI.split(':')[2];

            const ALBUM_CONTAINER = this.#createTileElement(ALBUM_IMAGE_URL, ALBUM_NAME_SHORT);

            //event listeners

            ALBUM_CONTAINER.addEventListener('click', () => {
                that.#openAlbum(ALBUM_DATA);
            });

            albumsContainer.appendChild(ALBUM_CONTAINER);
        }

        contentContainer.appendChild(albumsContainer);
    }

    #spawnPlaylistSearchResults(contentContainer, data) {
        contentContainer.innerHTML = "";
        const PLAYLISTS_DATA = data.playlists.items;

        const playlistsContainer = document.createElement('div');
        playlistsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(playlistsContainer, contentContainer);

        for (let i = 0; i < PLAYLISTS_DATA.length; i++) {
            const PLAYLIST_DATA = PLAYLISTS_DATA[i].data;
            if (PLAYLIST_DATA.__typename == "NotFound") continue;
            const PLAYLIST_NAME = PLAYLIST_DATA.name;
            const PLAYLIST_NAME_SHORT = shortenString(PLAYLIST_NAME, 20);
            const PLAYLIST_IMAGE_URL = PLAYLIST_DATA.images.items[0]?.sources[0].url || "standardImages/cover.jpg";

            const PLAYLIST_CONTAINER = this.#createTileElement(PLAYLIST_IMAGE_URL, PLAYLIST_NAME_SHORT);

            //event listeners

            playlistsContainer.appendChild(PLAYLIST_CONTAINER);
        }

        contentContainer.appendChild(playlistsContainer);
    }

    #createTileElement(imageURL, title) {
        const artistContainer = document.createElement('div');
        artistContainer.setAttribute('class', 'searchList_tile_container');

        const artistImageContainer = document.createElement('div');
        artistImageContainer.setAttribute('class', 'searchList_tile_image_container');

        const artistImage = document.createElement('img');
        artistImage.setAttribute('class', 'searchList_tile_image');
        artistImage.src = imageURL;

        const artistNameHTML = document.createElement('div');
        artistNameHTML.setAttribute('class', 'searchList_tile_title');
        artistNameHTML.innerHTML = title;

        artistImageContainer.appendChild(artistImage);

        artistContainer.appendChild(artistImageContainer);
        artistContainer.appendChild(artistNameHTML);

        return artistContainer;
    }

    #setArtistCSS(tileContainer, contentContainer) {
        const WIDTH = contentContainer.clientWidth;
        const NUMBER_CONTAINERS = Math.floor(WIDTH / 180);
        const REMAINDER = WIDTH % 180 - (NUMBER_CONTAINERS - 1) * 10; //added 10 for gap between containers
        const NEW_WIDTH = 180 + Math.floor(REMAINDER / NUMBER_CONTAINERS);
        const SAVE_NEW_WIDTH = NEW_WIDTH - 2;

        tileContainer.style.gridTemplateColumns = `repeat(auto-fill, ${SAVE_NEW_WIDTH}px)`;
    }

    updateSelectedPosition(position) {
        const OLD_POSITION = this.#selectedPosition;
        this.#selectedPosition = position;
        this.#lastPosition = OLD_POSITION;
    }
}