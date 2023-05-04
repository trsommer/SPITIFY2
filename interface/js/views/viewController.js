class ViewController {
    #singletonViews = {};
    #messageBroker = null;
    #menu = null;
    constructor() {
        if (ViewController.instance) {
            return ViewController.instance;
        }
        this.views = {};
        this.currentView = null;
        this.#messageBroker = new MessageBroker();
        this.#menu = new Menu(this);
        ViewController.instance = this;
        //this.#createSingletonViews();

        this.#testFunc();
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
            case "search": 
            case "searchList":
                newView = await this.#viewFactory(viewType, data);
                break;
            //singleton views
            case "playlists":
            case "settings":
            case "download":
            case "lastSearches":
                newView = this.#singletonViews[viewType];
                await newView.updateView();
                break;
            default: throw new Error("Invalid view type");
        }

        newView.show();
    }

    async #testFunc() {
        const VIEW = await new SearchView({}, this);
        VIEW.show();
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
        const messageBroker = this.#messageBroker;
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
        this.#singletonViews["settings"] = await this.#viewFactory("settings");
        this.#singletonViews["download"] = await this.#viewFactory("download");
        this.#singletonViews["lastSearches"] = await this.#viewFactory("lastSearches");
    }
    
    /**
     * Returns the private message broker of the class.
     *
     * @returns {MessageBroker} The private message broker of the class.
     */
    getMessageBroker() {
        return this.#messageBroker;
    }
}