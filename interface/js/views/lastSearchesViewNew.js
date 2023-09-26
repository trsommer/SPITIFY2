class LastSearchesView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #lastSearches = null; //the last searches
    #displayed = false
    #viewController = null
    #messageBroker = null
    #htmlLastSearches = []

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
        this.updateView();
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
        this.#messageBroker = viewController.getMessageBroker();
        this.#type = "lastSearches_view";
        
        const RETURN_VALUES = this.createHTMLContainer('Recently Searched', 'lastSearches_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        //create the last searches container

        this.#createLastSearchesButtons(RETURN_VALUES.contentContainer, data);

        this.#messageBroker.subscribe("addLastSearch", this.addLastSearch.bind(this));
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

        this.#updateLastSearchesView();
    }

    async #openLastSearch(id, type) {
        switch (type) {
            case "artist":
                this.#viewController.switchView("artist", id);
                break;
            case "album":
                this.#viewController.switchView("album", id);
                break;
            default:
                break;
        }

        const PREVIOUS_LAST_SEARCHES = this.#lastSearches;
        const PREVIOUS_LAST_SEARCHES_LENGTH = Object.keys(PREVIOUS_LAST_SEARCHES).length
        const DATA = PREVIOUS_LAST_SEARCHES.find(search => search.spotifyId === id) || null;

        for (let i = 0; i < PREVIOUS_LAST_SEARCHES_LENGTH; i++) {
            const LAST_SEARCH = PREVIOUS_LAST_SEARCHES[i];
            if (LAST_SEARCH.spotifyId == id) {
                await deleteSpecificLastSearch(id);
                await insertLastSearch(DATA);
                break;
            }
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
    async addLastSearch(data, directViewUpdate = true) {
        console.log(data);
        const PREVIOUS_LAST_SEARCHES = this.#lastSearches;
        const PREVIOUS_LAST_SEARCHES_LENGTH = PREVIOUS_LAST_SEARCHES.length

        //check if the search is already in the list
        for (let i = 0; i < PREVIOUS_LAST_SEARCHES_LENGTH; i++) {
            const LAST_SEARCH = PREVIOUS_LAST_SEARCHES[i];
            if (LAST_SEARCH.spotifyId == data.id) {
                await deleteSpecificLastSearch(data.id);
                PREVIOUS_LAST_SEARCHES.splice(i, 1);
                const HTML_LAST_SEARCH = this.#htmlLastSearches[data.id];
                this.#HTMLContent.removeChild(HTML_LAST_SEARCH);
                break;
            }
        }

        if (data.name == null || data.name == undefined) {
            throw new Error("The name of the last search is null or undefined.");
        }

        const dataNew = {
            type: data.type,
            name: data.name,
            spotifyId: data.id,
            imageUrl: data.imageUrl,
            additionalInfo: JSON.stringify(data.data)
        }
        
        await insertLastSearch(dataNew)
        this.#lastSearches.push(dataNew);

        if (directViewUpdate) this.#updateLastSearchesView();

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
            const DATA = {
                type: lastSearch.type,
                id : LAST_SEARCH_ID,
                item : lastSearchItem
            }


            lastSearchItemClickZone.addEventListener("click", function () {
                that.#openLastSearch(LAST_SEARCH_ID, lastSearch.type);
            });

            this.#addContextMenu(lastSearchItemClickZone, DATA)

            lastSearchCloseButton.addEventListener("click", function () {
                that.#removeLastSearch(LAST_SEARCH_ID, lastSearchItem);
            });


            contentContainer.appendChild(lastSearchItem);

            this.#htmlLastSearches[LAST_SEARCH_ID] = lastSearchItem;
        }


    }

    #addContextMenu(elem, data) {
        const that = this;
        const CONTEXT_DATA_TEST = [
            {
                title: "Open",
                callback: function(data) {
                    that.#openLastSearch(data.id, data.type);
                },
                subMenu: null
            },
            {
                title: "Remove from list",
                callback: function(data) {
                    that.#removeLastSearch(data.id, data.item);
                },
                subMenu: null
            }
        ]

        elem.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const CORD_X = e.clientX;
            const CORD_Y = e.clientY;
            const CONTEXT_MENU = new ContextMenu(CONTEXT_DATA_TEST, CORD_X, CORD_Y, this.#viewController);

            CONTEXT_MENU.show(data);
        });
    } 

    //callback methods
    
    #openFromContextMenu(data) {

    }

}