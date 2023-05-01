class SearchListView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #data = null; //all of the users playlists as objects
    #displayed = false
    #htmlHeadings = [];
    #htmlSelector = null;
    #selectedPosition = null;
    #searchResultsContainer = null;
    #query = "";
    #searchResults = [null, null, null, null]

    constructor(data) {
        super();
        return this.#constructorMethod(data);
    }

    //implemeneted methods

    /**
     * This method fetches the users playlists from a database and creates the playlist view for them.
     * @param {Object} data - The data to be used for the construction. (useless here)
     */
    async #constructorMethod(data) {
        await this.#createView(data);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show(viewController) {
        const viewPort = document.getElementById('viewport');
        const that = this;
        const data = this.#data
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
        this.#setSelectorPosition(data.position);
        this.#displayed = true

        window.electronAPI.updateSpotifySpecificSerach((event, response) => {
            const data = response.data.searchV2;
            that.#saveSearchResults(data);
            that.#spawnSearchResults(data);
        });
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
    async #createView(data) {
        this.#data = data;
        this.#type = "searchlist_view";
        this.#selectedPosition = data.position;
        this.#query = data.query;

        const returnValues = this.createHTMLContainer(null, 'searchlist_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        this.#setHeader(returnValues.contentContainer, data);
        this.#selectView(data.position);
        this.#createSearchResultsContainer(returnValues.contentContainer);
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

    //playlist specific methods


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
            that.#setSelectorPosition(0);
        });+
        artistHeader.addEventListener('click', () => {
            that.#selectView(0);
        });
        this.#htmlHeadings.push(artistHeader);
        const that = this;

        const songsHeader = document.createElement('div');
        songsHeader.setAttribute('class', 'searchList_header');
        songsHeader.innerHTML = 'Songs';
        songsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition(1);
        });
        songsHeader.addEventListener('click', () => {
            that.#selectView(1);
        });
        this.#htmlHeadings.push(songsHeader);

        const albumsHeader = document.createElement('div');
        albumsHeader.setAttribute('class', 'searchList_header');
        albumsHeader.innerHTML = 'Albums';
        albumsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition(2);
        });
        albumsHeader.addEventListener('click', () => {
            that.#selectView(2);
        });
        this.#htmlHeadings.push(albumsHeader);

        const playlistsHeader = document.createElement('div');
        playlistsHeader.setAttribute('class', 'searchList_header');
        playlistsHeader.innerHTML = 'Playlists';
        playlistsHeader.addEventListener('mouseenter', () => {
            that.#setSelectorPosition(3);
        });
        playlistsHeader.addEventListener('click', () => {
            that.#selectView(3);
        });
        this.#htmlHeadings.push(playlistsHeader);
        
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

    #setSelectorPosition(position) {
        const selector = this.#htmlSelector;
        const selectorDims = this.#getSelectorDims(position);

        selector.style.width = selectorDims.width + 'px';
        selector.style.left = selectorDims.leftOffset + 'px';

        if (position != this.#selectedPosition) {
            selector.classList.remove('searchList_header_selected_selector');
        } else {
            //check if the selector is already selected
            if (!selector.classList.contains('searchList_header_selected_selector')) {
                selector.classList.add('searchList_header_selected_selector');
            }
        }
    }

    #getSelectorDims(position) {
        const headingElem = this.#htmlHeadings[position];
        const offsetLeft = headingElem.offsetLeft;
        const clientWidth = headingElem.clientWidth;

        const selectorWidth = Math.floor(clientWidth * 0.8);
        const selectorLeftOffset = Math.floor(offsetLeft + (clientWidth - selectorWidth) / 2);

        return {
            width : selectorWidth,
            leftOffset : selectorLeftOffset
        }
    }

    #selectView(position) {
        const headingElem = this.#htmlHeadings[position];
        const selector = this.#htmlSelector;
        const oldSelectionPosition = this.#selectedPosition;
        const oldHeadingElem = this.#htmlHeadings[oldSelectionPosition];
        this.#selectedPosition = position;
        const types = ['Artists', 'Tracks', 'Albums', 'Playlists'];

        headingElem.classList.add('searchList_header_selected_text');
        selector.classList.add('searchList_header_selected_selector');

        if (headingElem != oldHeadingElem) {
            oldHeadingElem.classList.remove('searchList_header_selected_text');

        }

        const oldSerachResult = this.#loadSearchResults(position);

        if (oldSerachResult != null) {
            this.#spawnSearchResults(oldSerachResult);
        } else {
            this.#getData(this.#query, types[position], 100, 0);
        }
    }

    #getData(query, type, limit, offset) {
        getSpotifySearchResultsSpecificType(query, type, limit, offset)
    }

    #saveSearchResults(data) {
        const position = this.#selectedPosition;
        this.#searchResults[position] = data;
    }

    #loadSearchResults(position) {
        return this.#searchResults[position];
    }

    #createSearchResultsContainer(container) {
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.setAttribute('id', 'searchList_results_container');

        this.#searchResultsContainer = searchResultsContainer;

        container.appendChild(searchResultsContainer);
    }

    #spawnSearchResults(data) {
        const position = this.#selectedPosition;
        const contentContainer = this.#searchResultsContainer;

        switch (position) {
            case 0:
                this.#spawnArtistSearchResults(contentContainer, data);
                break;
            case 1:
                this.#spawnTrackSearchResults(contentContainer, data);
                break;
            case 2:
                this.#spawnAlbumSearchResults(contentContainer, data);
                break;
            case 3:
                this.#spawnPlaylistSearchResults(contentContainer, data);
                break;
            default:
                break;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    #spawnArtistSearchResults(contentContainer, data) {
        console.log(data);
        contentContainer.innerHTML = '';
        const artistsData = data.artists.items;
        
        const artistsContainer = document.createElement('div');
        artistsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(artistsContainer, contentContainer);

        for (let i = 0; i < artistsData.length; i++) {
            const artistData = artistsData[i].data;
            const artistImageUrl = artistData.visuals.avatarImage?.sources[0].url || "standardImages/cover.jpg";
            const artistName = artistData.profile.name;

            const artistContainer = this.#createTileElement(artistImageUrl, artistName);

            //event listeners

            artistsContainer.appendChild(artistContainer);
        }

        contentContainer.appendChild(artistsContainer);

    }

    #spawnTrackSearchResults(contentContainer, data) {
        console.log(data);
        contentContainer.innerHTML = '';
        const songsData = data.tracksV2.items;

        const songsContainer = document.createElement('div');
        songsContainer.setAttribute('id', 'searchList_songs_container');

        for (let i = 0; i < songsData.length; i++) {
            const songData = songsData[i].item.data;
            const songName = songData.name;
            const artistString = getArtistsAsString(songData.artists.items);
            const durationMS = songData.duration.totalMilliseconds;
            const durationString = getTrackLengthFromMS(durationMS);
            const imageURL = songData.albumOfTrack.coverArt?.sources[0].url || "standardImages/cover.jpg";

            const trackItem = document.createElement('div');
            trackItem.setAttribute('class', 'track_item');

            const trackSpacerLeft = document.createElement('div');
            trackSpacerLeft.setAttribute('class', 'track_spacer_left');

            const trackImageContainer = document.createElement('div');
            trackImageContainer.setAttribute('class', 'track_image_container');

            const trackImage = document.createElement('img');
            trackImage.setAttribute('class', 'track_image');
            trackImage.src = imageURL;

            const currentlyPlayingContainer = document.createElement('div');
            currentlyPlayingContainer.setAttribute('class', 'currently_playing_container');

            const currentlyPlayingBG = document.createElement('div');
            currentlyPlayingBG.setAttribute('class', 'currently_playing_background');

            const currentlyPlayingSVG = document.createElement('img');
            currentlyPlayingSVG.setAttribute('class', 'currently_playing_svg');
            currentlyPlayingSVG.src = 'icons/spitifyAnimated.svg';

            const trackName = document.createElement('p');
            trackName.setAttribute('class', 'track_text_left');
            trackName.innerHTML = songName;

            const trackArtists = document.createElement('p');
            trackArtists.setAttribute('class', 'track_text_middle');
            trackArtists.innerHTML = artistString;

            const trackLength = document.createElement('p');
            trackLength.setAttribute('class', 'track_text_right');
            trackLength.innerHTML = durationString;

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
        const albumsData = data.albums.items;

        const albumsContainer = document.createElement('div');
        albumsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(albumsContainer, contentContainer);

        for (let i = 0; i < albumsData.length; i++) {
            const albumData = albumsData[i].data;
            const albumName = albumData.name;
            const albumNameShort = shortenString(albumName, 20);
            const albumImageUrl = albumData.coverArt?.sources[0].url || "standardImages/cover.jpg";

            const albumContainer = this.#createTileElement(albumImageUrl, albumNameShort);

            //event listeners

            albumsContainer.appendChild(albumContainer);
        }

        contentContainer.appendChild(albumsContainer);
    }

    #spawnPlaylistSearchResults(contentContainer, data) {
        contentContainer.innerHTML = "";
        const playlistsData = data.playlists.items;

        const playlistsContainer = document.createElement('div');
        playlistsContainer.setAttribute('id', 'searchList_tiles_container');

        this.#setArtistCSS(playlistsContainer, contentContainer);

        for (let i = 0; i < playlistsData.length; i++) {
            const playlistData = playlistsData[i].data;
            const playlistName = playlistData.name;
            const playlistNameShort = shortenString(playlistName, 20);
            const playlistImageUrl = playlistData.images.items[0]?.sources[0].url || "standardImages/cover.jpg";

            const playlistContainer = this.#createTileElement(playlistImageUrl, playlistNameShort);

            //event listeners

            playlistsContainer.appendChild(playlistContainer);
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
        const width = contentContainer.clientWidth;
        const nrContainers = Math.floor(width / 180);
        const remainder = width % 180 - (nrContainers - 1) * 10; //added 10 for gap between containers
        const newWidth = 180 + Math.floor(remainder / nrContainers);
        const saveNewWidth = newWidth - 2;

        tileContainer.style.gridTemplateColumns = `repeat(auto-fill, ${saveNewWidth}px)`;
    }
}