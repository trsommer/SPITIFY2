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
    }

    #spawnArtistSearchResults(contentContainer, data) {
        console.log(data);
        contentContainer.innerHTML = '';
        const artistsData = data.artists.items;
        
        const artistsContainer = document.createElement('div');
        artistsContainer.setAttribute('id', 'searchList_artists_container');

        this.#setArtistCSS(artistsContainer, contentContainer);

        for (let i = 0; i < artistsData.length; i++) {
            const artistData = artistsData[i].data;
            const artistImageUrl = artistData.visuals.avatarImage?.sources[0].url || "standardImages/cover.jpg";
            const artistName = artistData.profile.name;

            const artistContainer = document.createElement('div');
            artistContainer.setAttribute('class', 'searchList_artist_container');

            const artistImageContainer = document.createElement('div');
            artistImageContainer.setAttribute('class', 'searchList_artist_image_container');

            const artistImage = document.createElement('img');
            artistImage.setAttribute('class', 'searchList_artist_image');
            artistImage.src = artistImageUrl;

            const artistNameHTML = document.createElement('div');
            artistNameHTML.setAttribute('class', 'searchList_artist_name');
            artistNameHTML.innerHTML = artistName;

            artistImageContainer.appendChild(artistImage);

            artistContainer.appendChild(artistImageContainer);
            artistContainer.appendChild(artistNameHTML);

            artistsContainer.appendChild(artistContainer);
        }

        contentContainer.appendChild(artistsContainer);

    }

    #setArtistCSS(artistContainer, contentContainer) {
        const width = contentContainer.clientWidth;
        const nrContainers = Math.floor(width / 180);
        const remainder = width % 180 - (nrContainers - 1) * 10; //added 10 for gap between containers
        const newWidth = 180 + Math.floor(remainder / nrContainers);
        const saveNewWidth = newWidth - 2;

        artistContainer.style.gridTemplateColumns = `repeat(auto-fill, ${saveNewWidth}px)`;
    }

    #spawnTrackSearchResults(artistContainer, data) {
        console.log(data);
    }

    #spawnAlbumSearchResults(artistContainer, data) {
        console.log(data);
    }

    #spawnPlaylistSearchResults(artistContainer, data) {
        console.log(data);
    }
}