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
                newView = this.#viewFactory(data);
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

        newView.show(this);
    }

    async #testFunc() {
        const data = {
            position: 0,
            query: "taylor"
        }
        const view = await new SearchListView(data);
        view.show(this);
    }

    async #viewFactory(data) {
        switch (viewType) {
            case "artist": return new ArtistView(data);
            case "album": return new AlbumView(data);
            case "playlist": return new PlaylistView(data);
            case "playlists": return new PlaylistsView(data);
            case "search": return new SearchView(data);
            case "searchList": return new SearchListView(data);
            case "download": return new DownloadView(data);
            case "settings": return new SettingsView(data);
            case "lastSearches": return new LastSearchesView(data);
            case "testView": return new TestView(data);
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