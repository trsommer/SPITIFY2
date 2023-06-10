class ViewController {
    #singletonViews = {};
    #messageBroker = null;
    #menu = null;
    #player = null;
    #queue = null;
    #lastSearch = ""; //will be replaced with object that stores various data
    #currentView = null;
    #nextSearchView = null;
    #lastViews = [];
    #contextMenus = [];
    constructor() {
        if (ViewController.instance) {
            return ViewController.instance;
        }
        ViewController.instance = this;
        this.views = {};
        this.currentView = null;
        return this.#constructorFunction();
    }

    async #constructorFunction() {
        this.#messageBroker = new MessageBroker();
        await this.#createSingletonViews();
        this.#createNextSearchView();
        this.#menu = new Menu(this);
        this.#registerViewListeners();
        this.#setInitialView();
        this.#player = await new Player(this)
        this.#queue = await new Queue(this.#player, this)
        return this;
    }

    /**
     * Registers Listeners that are not related to any single view (e.g. search click because search view is not static)
     * but control the view switching.
     */
    #registerViewListeners() {
        const searchInput = document.getElementById('top_search_input');
        searchInput.addEventListener('click', (event) => {
            const input = event.target.value;
            const query = input.trim();
            if (query == "" && !(this.#currentView instanceof LastSearchesView)) {
                this.switchView("lastSearches", null);
                return;
            }
            if (query != "" && !(this.#currentView instanceof SearchView)) {
                this.switchView("search", null);
            }
        });
        searchInput.addEventListener('input', (event) => {
            const query = event.target.value;
            this.#handleSearchInput(query);
        });
    }

        /*
     *  data: [
            entry1: {
                title: "title",
                callback: function() {},
                suMenu: null
            },

        ]
    */

    #setInitialView() {
        const VIEW = this.#singletonViews["lastSearches"];
        this.#currentView = VIEW
        VIEW.show();
    }

    /**
     * Asynchronously switches to a new view based on the provided view type and data.
     * @param {string} viewType - The type of view to switch to.
     * @param {*} data - The data to pass to the new view.
     * @throws {Error} If an invalid view type is provided.
     * @returns {Promise<void>}
     */
    async switchView(viewType, data) {
        let newView = null;
        switch (viewType) {
            //dynamic views
            case "artist":
            case "album":
            case "playlist":
            case "searchList":
                newView = await this.#viewFactory(viewType, data);
                break;
            //singleton views
            case "playlists":
            case "settings":
            case "download":
            case "lastSearches":
                newView = this.#singletonViews[viewType];
                //await newView.updateView();
                break;
            case "search": 
                newView = this.#getSearchView();
                break;
            default: throw new Error("Invalid view type");
        }
        this.#menu.setMenu(viewType);
        this.#currentView.hide();
        newView.show();
        this.#lastViews.push(this.#currentView);
        this.#currentView = newView;
        this.#hideContextMenu();
    }

    /**
     * Creates and returns a new view based on the given view type and data.
     * @async
     * @param {string} viewType - The type of view to create.
     * @param {*} data - The data to pass to the view.
     * @returns {Promise<View>} - A Promise that resolves with the created view.
     * @throws {Error} - If the view type is invalid.
     */
    async #viewFactory(viewType, data) {
        switch (viewType) {
            case "artist": return new ArtistView(data, this);
            case "album": return new AlbumView(data, this);
            case "playlist": return new PlaylistView(data, this);
            case "playlists": return new PlaylistsView(data, this);
            case "search": return new SearchView(data, this);
            case "searchList": return new SearchListView(data, this);
            case "download": return new DownloadView(data, this);
            case "settings": return new SettingsView(data, this);
            case "lastSearches": return new LastSearchesView(data, this);
            default: throw new Error("Invalid view type");
        }
    }

    /**
     * Asynchronously creates singleton views for playlists, settings, downloads, and
     * last searches using the view factory.
     * 
     * @returns {Promise<void>} A promise that resolves when all the singleton views have
     * been created.
     */
    async #createSingletonViews() {
        this.#singletonViews["playlists"] = await this.#viewFactory("playlists");
        //this.#singletonViews["settings"] = await this.#viewFactory("settings");
        this.#singletonViews
        ["download"] = await this.#viewFactory("download");
        this.#singletonViews["lastSearches"] = await this.#viewFactory("lastSearches");
    }
    
    async #createNextSearchView() {
        this.#nextSearchView = await this.#viewFactory("search");
    }

    #getSearchView() {
        const nextSearchView = this.#nextSearchView;
        return nextSearchView;
    }

    #handleSearchInput(input) {
        const query = input.trim();
        if (query.length === 0) {
            this.switchView("lastSearches", null);
            this.#lastSearch = "";
            return
        }
        if (query === this.#lastSearch) return;
        if (!(this.#currentView instanceof SearchView)) {
            this.switchView("search", null);
        }
        this.#lastSearch = query;
        getSpotifySearchResultsNoArgs(query);
    }

    /**
     * Returns the private message broker of the class.
     *
     * @returns {MessageBroker} The private message broker of the class.
     */
    getMessageBroker() {
        return this.#messageBroker;
    }

    getCurrentView() {      
        return this.#currentView;
    }

    getMenu() {
        return this.#menu;
    }

    addContextMenu(contextMenu) {
        this.#contextMenus.push(contextMenu);
    }

    #hideContextMenu() {
        this.#contextMenus.forEach(contextMenu => {
            contextMenu.hide();
        });
    }

    getQueue() {
        return this.#queue;
    }

    getPlayer() {
        return this.#player;
    }
}