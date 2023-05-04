class LastSearchesView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #lastSearches = null; //the last searches
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
        const LAST_SERACHES = await getLastSearches();
        await this.#createView(LAST_SERACHES, viewController);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show() {
        const viewPort = document.getElementById('viewport');
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
        this.#lastSearches = data;
        this.#viewController = viewController;
        this.#type = "lastSearches_view";
        
        const RETURN_VALUES = this.createHTMLContainer('Recently Searched', 'lastSearches_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        //create the last searches container

        this.#createLastSearchesButtons(RETURN_VALUES.contentContainer, data);
    }

    async updateView() {
        this.#updateLastSearchesView();
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

    #removeLastSearch(lastSearchId, lastSearchItem) {
        const CONTENT_CONTAINER = this.#HTMLContent;

        //remove the item from the dom
        CONTENT_CONTAINER.removeChild(lastSearchItem);

        //remove the item from the database
        deleteSpecificLastSearch(lastSearchId);
    }

    async #openLastSearch(lastSearchId, type) {
        switch (type) {
            case "artist":
                const ARTIST = await getSpotifyArtist(lastSearchId);
                this.#viewController.switchView("artist", ARTIST);
                break;
            case "album":
                this.#viewController.switchView("album", lastSearchId);
                break;
            default:
                break;
        }
    }

    /**
     * Adds a new search to the last searches list.
     * If the list already contains the new search, it will be removed from its previous position.
     * If the list is full (16 elements), the oldest search will be removed.
     *
     * @param {string} type - The type of the search.
     * @param {string} name - The name of the search result.
     * @param {string} spotifyId - The Spotify ID of the search result.
     * @param {string} imageUrl - The image URL of the search result.
     * @param {string} additionalInfo - Additional information about the search result.
     */
    async addLastSearch(type, name, spotifyId, imageUrl, additionalInfo) {
        const PREVIOUS_LAST_SEARCHES = await getLastSearches()
        const PREVIOUS_LAST_SEARCHES_LENGTH = Object.keys(PREVIOUS_LAST_SEARCHES).length

        if (PREVIOUS_LAST_SEARCHES_LENGTH == 16) {
            let found = false
    
            for (let index = 0; index < PREVIOUS_LAST_SEARCHES.length; index++) {
                const lastSearch = PREVIOUS_LAST_SEARCHES[index];
                if (lastSearch.spotifyId == spotifyId) {
                    found = true;
                    await deleteSpecificLastSearch(spotifyId);
                    break;
                }
            }
    
            if (!found) {
                await deleteLastSearch();
            }
        }

        const data = {
            type: type,
            name: name,
            spotifyId: spotifyId,
            imageUrl: imageUrl,
            additionalInfo: additionalInfo
        }
        
        await insertLastSearch(data)
    }

    async #updateLastSearchesView() {
        const lastSearches = await getLastSearches();
        this.#createLastSearchesButtons(this.#HTMLContent, lastSearches);
    }

    //html creation methods

    #createLastSearchesButtons(contentContainer, lastSearches) {
        contentContainer.innerHTML = '';

        for (let i = 0; i < lastSearches.length; i++) {
            const lastSearch = lastSearches[i];
            if (lastSearch == null || lastSearch == undefined) {
                continue;
            }

            const LAST_SEARCH_ID = lastSearch.spotifyId;

            const lastSearchItem = document.createElement("div");
            lastSearchItem.classList.add("last_search_item");
        
            const lastSearchItemClickZone = document.createElement("div");
            lastSearchItemClickZone.classList.add("last_search_item_click_zone");
        
            const lastSearchImage = document.createElement("img");
            lastSearchImage.classList.add("last_search_item_image");
            lastSearchImage.src = lastSearch.imageUrl;
        
            const lastSearchTextContainer = document.createElement("div");
            lastSearchTextContainer.classList.add("last_search_item_text");
        
            const lastSearchTitle = document.createElement("p");
            lastSearchTitle.classList.add("last_search_item_text_title");
            name = shortenString(lastSearch.name, 25);
            lastSearchTitle.innerHTML = name;
        
            const lastSearchTypeHTML = document.createElement("p");
            lastSearchTypeHTML.classList.add("last_search_item_text_type");
            lastSearchTypeHTML.innerHTML = lastSearch.type;
        
            const lastSearchCloseButton = document.createElement("img");
            lastSearchCloseButton.classList.add("last_search_item_close_button");
            lastSearchCloseButton.src = "icons/close.svg";
        
            lastSearchTextContainer.appendChild(lastSearchTitle);
            lastSearchTextContainer.appendChild(lastSearchTypeHTML);
        
            lastSearchItemClickZone.appendChild(lastSearchImage);
            lastSearchItemClickZone.appendChild(lastSearchTextContainer);
        
            lastSearchItem.appendChild(lastSearchItemClickZone);
            lastSearchItem.appendChild(lastSearchCloseButton);

            const that = this;

            lastSearchItemClickZone.addEventListener("click", function () {
                that.#openLastSearch(LAST_SEARCH_ID, lastSearch.type);
            });

            lastSearchCloseButton.addEventListener("click", function () {
                that.#removeLastSearch(LAST_SEARCH_ID, lastSearchItem);
            });


            contentContainer.appendChild(lastSearchItem);
        }


    }

}