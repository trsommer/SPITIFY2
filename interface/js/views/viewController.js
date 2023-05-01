class ViewController {
    #singletonViews = {};
    constructor() {
        if (ViewController.instance) {
            return ViewController.instance;
        }
        this.views = {};
        this.currentView = null;
        ViewController.instance = this;
        //this.#createSingletonViews();
        this.#testFunc();

    }

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
        const data = {
            position: 0,
            query: "taylor"
        }
        const view = await new SearchView({}, this);
        view.show();
    }

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
        this.#singletonViews["settings"] = await this.#viewFactory("settings");
        this.#singletonViews["download"] = await this.#viewFactory("download");
        this.#singletonViews["lastSearches"] = await this.#viewFactory("lastSearches");
    }
    
    
}