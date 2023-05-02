class PlaylistsView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #playlists = null; //all of the users playlists as objects
    #playlistsHTMLPointers = {}; //all of the playlists HTML pointers
    #displayed = false
    #viewController = null;

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
        const playlists = await this.#getPlaylistsFromDB();
        await this.#createView(playlists, viewController);
        return this
    }

    /**
     * Clears the viewport and adds the view HTML to it.
     */
    show() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
        this.#displayed = true
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
        this.#playlists = data;
        this.#viewController = viewController;
        this.#type = "playlists_view";

        this.#playlistsHTMLPointers = {
            playlists : [],
            likedSongsPlaylist : null,
            addPlaylistButton : null
        }

        const returnValues = this.createHTMLContainer('Your Playlists', 'playlists_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        this.#createHTMLPlaylistLikedSongs(returnValues.contentContainer);
        this.#createHTMLUserPlaylists(returnValues.contentContainer, data);
        this.#createHTMLNewPlaylistButton(returnValues.contentContainer);
    }

    async updateView() {
        this.#updatePlaylistsView();
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

    //playlist specific methods

    //will be replaced with electron api call to avoid sql injection/**
    /**
     * Retrieves all playlists from the database
     * @async
     * @function
     * @returns {Array} An array of playlist objects
     */
    async #getPlaylistsFromDB() {
        const playlists = await getFromDB("SELECT * FROM playlists")
        this.#playlists = playlists
        return playlists
    }

    /**
     * Retrieves a playlist from the database.
     *
     * @param {number} playlistId - The ID of the playlist to retrieve.
     * @returns {Object} - the playlist object from the database.
     */
    async #getPlaylistFromDB(playlistId) {
        playlistName = 'playlist' + playlistId;
        playlist = await getFromDB("SELECT * FROM " + playlistName)
        return playlist;
    }

    /**
     * Creates a new playlist and updates the playlists view.
     * @param {Array} playlists - The current list of playlists.
     * @returns {Promise<number>} - The ID of the created playlist.
     */
    async createPlaylist() {
        const playlists = this.getPlaylists()
        const playlistNewLength = playlists.length + 1
        const data = {
            name: "Your Playlist " + playlistNewLength,
            remote: 0,
            locked: 0,
            spotifyId: "",
            imageUrl: "standardImages/cover.jpg",
            author: "You"
        }
        
        const id = await createPlaylistDB(data)
        playlists.push(data)
        this.#updatePlaylistsView(playlists);
    
        return id;
    }

    /**
     * Creates a new specific playlist with the given name, author, image URL, and locked status.
     * 
     * @param {string} name - The name of the playlist.
     * @param {string} author - The name of the author of the playlist.
     * @param {string} imageUrl - The URL of the playlist's image.
     * @param {boolean} locked - Whether or not the playlist is locked.
     * @returns {Promise<string>} The ID of the newly created playlist.
     */
    async createSpecificPlaylist(name, author, imageUrl, locked) {
        const playlists = getPlaylists()
        const data = {
            name: name,
            remote: 0,
            locked: locked,
            spotifyId: "",
            imageUrl: imageUrl,
            author: author
        }
    
        const id = await createPlaylistDB(data)
        playlists.push(data)
        this.#updatePlaylistsView(playlists);
    
        return id;
    }

    /**
     * Asynchronously opens a playlist with the given ID.
     * If the playlistId is "Likes", the users favourite songs playlist is opened.
     *
     * @param {string|number} playlistId - The ID of the playlist to open.
     */
    async openPlaylist(playlistId) {
        let data;
        if(playlistId == 'Likes') {
            data = {
                id: "Likes",
                imageUrl: "standardImages/cover.jpg",
                name: "Your Favourite Songs",
                remote: 0,
                spotifyId: "",
                author: "You"
            }
        } else {
            data = this.#playlists[playlistId - 1];
        }
        const result = await getPlaylistSongs(playlistId);

        const playlistData = {
            playlistInfo: data,
            songs: result
        }

        this.#viewController.switchView('playlist', playlistData);
    }

    /**
     * Returns the users playlists as objects.
     */
    getPlaylists() {
        return this.#playlists;
    }

    //HTML specific methods

    /**
     * Creates the standard HTML playlists for the given content container.
     *
     * @param {HTMLElement} contentContainer - The container to append the playlists to. 
     */
    #createHTMLPlaylistLikedSongs(contentContainer) {
        const playlistLikesContainer = document.createElement('div');
        const that = this;
        playlistLikesContainer.setAttribute('id', 'playlists_liked_songs');
        playlistLikesContainer.innerHTML = '<svg id="playlist_liked_song_image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1 playlists_plusButton_background" width="200" height="200"></rect><path class="cls-2 playlists_plusButton" d="M148.27,88.43h-36.7V51.73a11.57,11.57,0,1,0-23.14,0v36.7H51.73a11.57,11.57,0,0,0,0,23.14h36.7v36.7a11.57,11.57,0,0,0,23.14,0v-36.7h36.7a11.57,11.57,0,0,0,0-23.14Z"></path></g></g></svg>';
        playlistLikesContainer.addEventListener('click', (e) => {
            that.openPlaylist("Likes");
        });

        const playlistLikesTextContainer = document.createElement('div');
        playlistLikesTextContainer.setAttribute('id', 'playlists_liked_songs_text_Container');

        const playlistLikesText = document.createElement('p');
        playlistLikesText.setAttribute('id', 'playlists_liked_songs_text');
        playlistLikesText.innerHTML = 'Your Favourite Songs';

        playlistLikesTextContainer.appendChild(playlistLikesText);
        playlistLikesContainer.appendChild(playlistLikesTextContainer);
        contentContainer.appendChild(playlistLikesContainer);

        this.#playlistsHTMLPointers.likedSongsPlaylist = playlistLikesContainer;
    }
    
    /**
     * Creates HTML elements for a list of user playlists and appends them to a given container
     * @param {HTMLElement} contentContainer - The HTML element to append the playlists to
     * @param {Array} playlists - An array containing the playlist objects to create elements for 
     */
    #createHTMLUserPlaylists(contentContainer, playlists) {
        this.#playlistsHTMLPointers.playlists = [];

        if (playlists.length > 6) {
            this.#setPlaylistItemCorrectDims(false);
        } else {
            this.#setPlaylistItemCorrectDims(true);
        }

        for (let index = 0; index < playlists.length; index++) {
            let name = playlists[index].name;
            const id = playlists[index].id;
            const imageUrlString = playlists[index].imageUrl;
            const imageUrls = imageUrlString.split(",");
            const imageUrl = imageUrls[0];
            const that = this;
    
            if (name == "") {
                name = "Playlist " + id;
            }
    
            const playlistItem = document.createElement("div");
            playlistItem.classList.add("playlists_item");
    
            const playlistTextContainer = document.createElement("div");
            playlistTextContainer.classList.add("playlists_item_text_container");
    
            const playlistTitle = document.createElement("p");
            playlistTitle.classList.add("playlists_item_text");
            playlistTitle.innerHTML = name;
    
            playlistTextContainer.appendChild(playlistTitle);
    
            if (imageUrls.length == 1) {
                //singe image
                const playlistImage = document.createElement("img");
                playlistImage.classList.add("playlist_item_image");
                playlistImage.src = imageUrl;
                playlistItem.appendChild(playlistImage);
            } else {
                //quad image
    
                const playlistImageContainer = document.createElement("div");
                playlistImageContainer.classList.add("playlist_item_image_container");
    
                for (let i = 0; i < 4; i++) {
                    var playlistImage = document.createElement("img");
                    playlistImage.classList.add("playlist_item_quad_image");
                    playlistImage.src = imageUrls[i];
                    playlistImageContainer.appendChild(playlistImage);
                }        
    
                playlistItem.appendChild(playlistImageContainer);
            }
    
            playlistItem.appendChild(playlistTextContainer);
    
            playlistItem.addEventListener("click", function () {
                that.openPlaylist(id);
            });
    
            contentContainer.appendChild(playlistItem);

            this.#playlistsHTMLPointers.playlists.push(playlistItem);
        }
    }

    /**
     * Creates an HTML button element for adding a new playlist.
     * @param {HTMLElement} contentContainer - The container element where the button will be appended. 
     */
    #createHTMLNewPlaylistButton(contentContainer) {
        const addNewPlaylistButton = document.createElement('div');
        addNewPlaylistButton.setAttribute('id', 'playlists_add_Playlist');
        addNewPlaylistButton.setAttribute('class', 'playlists_item');
        addNewPlaylistButton.innerHTML = '<svg class="playlist_item_image" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs></defs><g id="Layer_2" data-name="Layer 2"><g id="Layer_1-2" data-name="Layer 1"><rect class="cls-1 playlists_plusButton_background" width="200" height="200"></rect><path class="cls-2 playlists_plusButton" d="M148.27,88.43h-36.7V51.73a11.57,11.57,0,1,0-23.14,0v36.7H51.73a11.57,11.57,0,0,0,0,23.14h36.7v36.7a11.57,11.57,0,0,0,23.14,0v-36.7h36.7a11.57,11.57,0,0,0,0-23.14Z"></path></g></g></svg>';
        const that = this;
        addNewPlaylistButton.addEventListener('click', function () {
            that.createPlaylist();
        });

        const playlistItemTextContainer = document.createElement('div');
        playlistItemTextContainer.setAttribute('class', 'playlists_item_text_container');

        const playlistItemText = document.createElement('p');
        playlistItemText.setAttribute('class', 'playlists_item_text');
        playlistItemText.innerHTML = 'Add New Playlist';

        playlistItemTextContainer.appendChild(playlistItemText);
        addNewPlaylistButton.appendChild(playlistItemTextContainer);
        contentContainer.appendChild(addNewPlaylistButton);

        this.#playlistsHTMLPointers.addPlaylistButton = addNewPlaylistButton;
    }

    /**
     * Update the playlists view with the given new playlists.
     * 
     * @param {Array} newPlaylists - The new playlists to display.
     */
    #updatePlaylistsView(newPlaylists) {
        const createPlaylistButton = this.#playlistsHTMLPointers.addPlaylistButton;
        const contentContainer = this.#HTMLContent;
        const playlistsHTML = this.#playlistsHTMLPointers.playlists;

        contentContainer.removeChild(createPlaylistButton);

        //remove all playlists
        for (let index = 0; index < playlistsHTML.length; index++) {
            const playlistElement = playlistsHTML[index];
            contentContainer.removeChild(playlistElement);
        }

        this.#createHTMLUserPlaylists(contentContainer, newPlaylists);
        
        contentContainer.appendChild(createPlaylistButton);
    }

    //this will prob. be changed/removed later when a better solution is found
    #setPlaylistItemCorrectDims(wide) {
        if (wide) {
            document.documentElement.style.setProperty("--playlistsItemWidth", "234px");
            document.documentElement.style.setProperty("--playlistsItemImageWidth", "187.2px");
            document.documentElement.style.setProperty("--playlistsItemImageTopMargin", "23.4px");
        } else {
            document.documentElement.style.setProperty("--playlistsItemWidth", "231.4px");
            document.documentElement.style.setProperty("--playlistsItemImageWidth", "185.28px");
            document.documentElement.style.setProperty("--playlistsItemImageTopMargin", "23.16px");
        }
    }

}