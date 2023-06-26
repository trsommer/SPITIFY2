class SearchView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #HTMLPointers = null;
    #viewController = null;
    #messageBroker = null;
    #selectedSongHTML = null
    #boundUnSelectSong = null

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
        await this.#createView(data, viewController);
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
        this.#messageBroker.subscribe("updateSpotifySearch", this.updateSpotifySearch.bind(this));
    }

    /**
     * Clears the viewport.
     */
    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        this.#displayed = false
        this.#messageBroker.unsubscribe("updateSpotifySearch", this.updateSpotifySearch.bind(this));
    }

    /**
     * Creates a view with the given type and data.
     * 
     * @async
     * @param {Object} data - The data to use in the view.
     */
    async #createView(data, viewController) {
        this.#type = "search_view";
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        const RETURN_VALUES = this.createHTMLContainer(null, 'search_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        this.#createHTMLContainers(RETURN_VALUES.contentContainer)
    }

    async updateView() {
        //not used here
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

    //search specific methods

    updateSpotifySearch(response) {
        const RESULT = response.data.searchV2
        console.log(RESULT)
        console.log(this);
        this.#populateContent(RESULT)
    }

    #openArtist(artistData) {
        this.#viewController.switchView('artist', artistData);
    }

    #openAlbum(albumData) {
        this.#viewController.switchView('album', albumData);
    }

    #openSearchList(position) {
        const QUERY = document.getElementById("top_search_input").value;
        const DATA = {
            position: position,
            query: QUERY
        }
        this.#viewController.switchView("searchList", DATA)
    }

    //html creation methods

    #createHTMLContainers(contentContainer) {
        const leftSearchContainer = document.createElement("div");
        leftSearchContainer.setAttribute("id", "search_left_container");

        const mostRelevantContainer = document.createElement("div");
        mostRelevantContainer.setAttribute("id", "search_most_relevant_result");

        const artistsContainer = document.createElement("div");
        artistsContainer.setAttribute("id", "search_results_artist_container");

        leftSearchContainer.appendChild(mostRelevantContainer);
        leftSearchContainer.appendChild(artistsContainer);

        const spacer = document.createElement("div");
        spacer.setAttribute("id", "search_container_spacer");

        const rightSearchContainer = document.createElement("div");
        rightSearchContainer.setAttribute("id", "search_right_container");

        const songsContainer = document.createElement("div");
        songsContainer.setAttribute("id", "search_results_song_container");

        const albumsAndPlaylistsContainer = document.createElement("div");
        albumsAndPlaylistsContainer.setAttribute("id", "search_bottom_right_container");

        rightSearchContainer.appendChild(songsContainer);
        rightSearchContainer.appendChild(albumsAndPlaylistsContainer);

        contentContainer.appendChild(leftSearchContainer);
        contentContainer.appendChild(spacer);
        contentContainer.appendChild(rightSearchContainer);

        this.#HTMLPointers = {
            mostRelevantContainer: mostRelevantContainer,
            artistsContainer: artistsContainer,
            songsContainer: songsContainer,
            albumsAndPlaylistsContainer: albumsAndPlaylistsContainer
        }
    }

    /**
     * Populates the content of this object with data from the given content object.
     *
     * @param {Object} content - The content object to populate data from.
     * @param {Array<Object>} content.artists - The list of artist objects.
     * @param {Array<Object>} content.tracksV2 - The list of song objects.
     * @param {Array<Object>} content.albums - The list of album objects.
     * @param {Array<Object>} content.playlists - The list of playlist objects.
     */
    #populateContent(content) {
        const ARTISTS = content.artists;
        const SONGS = content.tracksV2;
        const ALBUMS = content.albums;
        const PLAYLISTS = content.playlists;

        this.#setHightlightContent(ARTISTS);
        this.#setArtistsContent(ARTISTS);
        this.#setSongsContent(SONGS);
        this.#setAlbumsContent(ALBUMS);
        this.#setPlaylistsContent(PLAYLISTS);
    }

    /**
     * Sets the highlighted content based on the given content.
     * @param {Object} content - the content object parameter that contains the data to be displayed 
     */
    #setHightlightContent(content) {
        const CONTAINER = this.#HTMLPointers.mostRelevantContainer
        CONTAINER.innerHTML = '';
        const that = this;
        const ARTIST_DATA = content["items"]["0"]["data"];
        const ARTIST_NAME = ARTIST_DATA["profile"]["name"];
        const ARTIST_NAME_LENGTH = ARTIST_NAME.length;
        const SPOTIFY_URI = ARTIST_DATA["uri"];
        const SPOTIFY_ID = SPOTIFY_URI.replace("spotify:artist:", "");

        const AVATAR_IMAGE = ARTIST_DATA["visuals"]["avatarImage"];
        const IMAGE_URL = AVATAR_IMAGE?.["sources"]["0"]["url"] ?? "standardImages/cover.jpg";


        const hightlightHeading = document.createElement("h2");
        hightlightHeading.innerHTML = "Top Result";
        hightlightHeading.setAttribute("id", "search_most_relevant_result_heading");

        const hightlightContainer = document.createElement("div");
        hightlightContainer.setAttribute("id", "search_most_relevant_result_image_container");
        hightlightContainer.addEventListener("click", () => {
            that.#openArtist(ARTIST_DATA);
        })
        const hightlightImageDarkener = document.createElement("div");
        hightlightImageDarkener.setAttribute("id", "search_most_relevant_image_darkener");

        const hightlightImage = document.createElement("img");
        hightlightImage.setAttribute("id", "search_most_relevant_image");
        hightlightImage.src = IMAGE_URL;

        const hightlightTextContainer = document.createElement("div");
        hightlightTextContainer.setAttribute("id", "search_most_relevant_result_image_heading_container");

        const hightlightText = document.createElement("p");
        hightlightText.setAttribute("id", "search_most_relevant_result_image_heading");
        hightlightText.innerHTML = ARTIST_NAME;
        
        if (ARTIST_NAME_LENGTH > 10) {
            //clear class list of artistNameContainer
            hightlightText.classList.add("search_most_relevant_result_image_heading_small");
          } else {
            hightlightText.classList.add("search_most_relevant_result_image_heading_big");
          }

        hightlightTextContainer.appendChild(hightlightText);

        hightlightContainer.appendChild(hightlightImageDarkener);
        hightlightContainer.appendChild(hightlightImage);
        hightlightContainer.appendChild(hightlightTextContainer);

        CONTAINER.appendChild(hightlightHeading);
        CONTAINER.appendChild(hightlightContainer);
    }

    /**
     * Sets the content of the artist container with the given content.
     * @param {Object} content - The content to populate the container with. 
     */
    #setArtistsContent(content) {
        const CONTAINER = this.#HTMLPointers.artistsContainer
        const that = this;
        CONTAINER.innerHTML = '';
        const ARTISTS = content["items"];
        let length = 5;
        if (ARTISTS.length < length) length = ARTISTS.length;

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Artists";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList("Artists");
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const artistResultContainer = document.createElement("div");
        artistResultContainer.setAttribute("id", "search_results_artists");

        for (let i = 1; i < length; i++) {
            const ARTIST_DATA = ARTISTS[i]["data"];
            if (ARTIST_DATA == undefined) return;
            const SPOTIFY_URI = ARTIST_DATA["uri"];
            const SPOTIFY_ID = SPOTIFY_URI.replace("spotify:artist:", "");
            let imageUrl = "standardImages/cover.jpg";
            if (ARTIST_DATA["visuals"]["avatarImage"] != null) {
                imageUrl = ARTIST_DATA["visuals"]["avatarImage"]["sources"][0]["url"];
              }
            const ARTIST_NAME = ARTIST_DATA["profile"]["name"];

            const artistContainer = document.createElement("div");
            artistContainer.classList.add("search_results_artist");
            artistContainer.addEventListener("click", () => {
                that.#openArtist(ARTIST_DATA)
            })
        
            const artistImageContainer = document.createElement("div");
            artistImageContainer.classList.add("search_results_artist_image_container");
        
            const artistImage = document.createElement("img");
            artistImage.classList.add("search_results_artist_image");
            artistImage.src = imageUrl;

            const artistText = document.createElement("div");
            artistText.classList.add("search_results_artist_text");
        
            const artistNameHTML = document.createElement("p");
            artistNameHTML.classList.add("search_results_artist_text_artist");
            artistNameHTML.innerHTML = ARTIST_NAME;
        
            const artistType = document.createElement("p");
            artistType.classList.add("search_results_artist_text_type");
            artistType.innerHTML = "Artist";
        
            artistImageContainer.appendChild(artistImage);

            artistText.appendChild(artistNameHTML);
            artistText.appendChild(artistType);
        
            artistContainer.appendChild(artistImageContainer);
            artistContainer.appendChild(artistText);

            artistResultContainer.appendChild(artistContainer);
            
        }

        CONTAINER.appendChild(headerContainer);
        CONTAINER.appendChild(artistResultContainer);

    }

    /**
     * Sets the content of the songs container with the given content object.
     * @param {Object} content - The content object containing an array of songs. 
     */
    #setSongsContent(content) {
        const container = this.#HTMLPointers.songsContainer
        container.innerHTML = '';
        const that = this;
        const SONGS = content["items"];

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Songs";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList("Tracks");
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const songResultContainer = document.createElement("div");
        songResultContainer.setAttribute("id", "search_section_songs_result");

        const songLength = SONGS.length < 5 ? length = SONGS.length : length = 5

        for (let i = 0; i < songLength; i++) {
            const SONG = SONGS[i]['item']['data'];
            const Song_NAME = SONG["name"];
            const SONG_ID = SONG["id"];
            const SONG_IMAGE_URL = getImageCoverUrl(SONG)
            const ARTISTS = getArtistsAsString(SONG.artists.items);
            const TRACK_TIME_MS = SONG["duration"]["totalMilliseconds"];
            const TRACK_TIME_FORMATED = timeConvert(TRACK_TIME_MS);

            const songContainer = document.createElement("div");
            songContainer.classList.add("search_results_song");
            songContainer.addEventListener("click", () => {
                //play song
            })
            this.#addSongContextMenu(songContainer, SONG)

            const songNumberContainer = document.createElement("div");
            songNumberContainer.classList.add("search_results_song_number");
        
            const songNumber = document.createElement("p");
            songNumber.innerHTML = i + 1;
        
            const songImageContainer = document.createElement("div");
            songImageContainer.classList.add("search_results_song_image_container");
        
            const currentlyPlayingContainer = document.createElement("div");
            currentlyPlayingContainer.classList.add("currently_playing_container");
            currentlyPlayingContainer.classList.add("search_currently_playing_container")
        
            const currentlyPlayingBackground = document.createElement("div");
            currentlyPlayingBackground.classList.add("currently_playing_background");
        
            const currentlyPlayingImage = document.createElement("img");
            currentlyPlayingImage.classList.add("currently_playing_svg");
            currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

            currentlyPlayingContainer.appendChild(currentlyPlayingBackground);
            currentlyPlayingContainer.appendChild(currentlyPlayingImage);

            const songImage = document.createElement("img");
            songImage.classList.add("search_result_track_image");
            songImage.src = SONG_IMAGE_URL;

            songImageContainer.appendChild(songImage);
            songImageContainer.appendChild(currentlyPlayingContainer);

            const songTextContainer = document.createElement("div");
            songTextContainer.classList.add("search_results_song_text");

            const songTitle = document.createElement("p");
            songTitle.classList.add("search_results_song_text_title");
            songTitle.innerHTML = Song_NAME;

            const songArtist = document.createElement("p");
            songArtist.classList.add("search_results_song_text_artist");
            songArtist.innerHTML = ARTISTS;

            const songTime = document.createElement("p");
            songTime.classList.add("search_results_song_text_time");
            songTime.innerHTML = TRACK_TIME_FORMATED;

            songTextContainer.appendChild(songTitle);
            songTextContainer.appendChild(songArtist);

            songNumberContainer.appendChild(songNumber);

            songContainer.appendChild(songNumberContainer);
            songContainer.appendChild(songImageContainer);
            songContainer.appendChild(songTextContainer);
            songContainer.appendChild(songTime);

            songResultContainer.appendChild(songContainer);

        }

        container.appendChild(headerContainer);
        container.appendChild(songResultContainer);
    }

    /**
     * Sets the content of the albums and playlists container with the given content.
     * @param {Object} content - The content to set in the container 
     */
    #setAlbumsContent(content) {
        const CONTAINER = this.#HTMLPointers.albumsAndPlaylistsContainer
        const that = this;
        CONTAINER.innerHTML = '';
        const ALBUMS = content["items"];

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Albums";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList("Albums");
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const albumResultContainer = document.createElement("div");
        albumResultContainer.setAttribute("id", "search_results_albums");

        const albumLength = ALBUMS.length < 5 ? length = ALBUMS.length : length = 5

        for (let i = 0; i < albumLength; i++) {
            const ALBUM_DATA = ALBUMS[i]["data"];
            const ALBUM_NAME = ALBUM_DATA["name"];
            const ALBUM_YEAR = ALBUM_DATA["date"]["year"];
            const ALBUM_IMAGE_URL = ALBUM_DATA["coverArt"]["sources"][0]["url"]
            const ALBUM_ARTISTS_STRING = getArtistsAsString(ALBUM_DATA.artists.items);
            const ALBUM_URI = ALBUM_DATA["uri"];
            const ALBUM_ID = ALBUM_URI.split(":")[2];

            const albumContainer = document.createElement("div");
            albumContainer.classList.add("search_results_album");
            albumContainer.addEventListener("click", () => {
                that.#openAlbum(ALBUM_DATA);
            })
        
            const albumImageContainer = document.createElement("div");
            albumImageContainer.classList.add("search_results_album_image_container");
        
            const albumImage = document.createElement("img");
            albumImage.classList.add("search_results_album_image");
            albumImage.src = ALBUM_IMAGE_URL;
        
            albumImageContainer.appendChild(albumImage);
        
            const albumTextContainer = document.createElement("div");
            albumTextContainer.classList.add("search_results_album_text");
        
            const albumTitle = document.createElement("p");
            albumTitle.classList.add("search_results_album_text_title");
            albumTitle.innerHTML = ALBUM_NAME;
        
            const albumYearHTML = document.createElement("p");
            albumYearHTML.classList.add("search_results_album_text_type");
            albumYearHTML.innerHTML = ALBUM_YEAR;
        
            albumTextContainer.appendChild(albumTitle);
            albumTextContainer.appendChild(albumYearHTML);
        
            albumContainer.appendChild(albumImageContainer);
            albumContainer.appendChild(albumTextContainer);

            albumResultContainer.appendChild(albumContainer);
        }

        CONTAINER.appendChild(headerContainer);
        CONTAINER.appendChild(albumResultContainer);
    }

    /**
     * Sets the content of the playlists container based on provided content.
     * @param {Object} content - Object containing playlist data
     */
    #setPlaylistsContent(content) {
        const CONTAINER = this.#HTMLPointers.albumsAndPlaylistsContainer
        const PLAYLISTS = content["items"];
        const that = this;

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Playlists";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList("Playlists");
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const playlistResultContainer = document.createElement("div");
        playlistResultContainer.setAttribute("id", "search_results_playlists");

        const playlistLength = PLAYLISTS.length < 5 ? length = PLAYLISTS.length : length = 5

        for (let i = 0; i < playlistLength; i++) {
            const PLAYLIST_DATA = PLAYLISTS[i]["data"];
            let playlistName = PLAYLIST_DATA["name"];
            if (playlistName == "") playlistName = "Untitled Playlist";
            const PLAYLIST_OWNER = PLAYLIST_DATA["ownerV2"]["data"]["name"];
            var imgUrl = PLAYLIST_DATA["images"]["items"]["0"]["sources"]["0"]["url"];
            if (imgUrl == undefined) imgUrl = "standardImages/cover.jpg";
            
            const playlistContainer = document.createElement("div");
            playlistContainer.classList.add("search_results_album");
            playlistContainer.id = "search_results_album_" + i;
        
            const playlistImageContainer = document.createElement("div");
            playlistImageContainer.classList.add("search_results_album_image_container");
        
            const playlistImage = document.createElement("img");
            playlistImage.classList.add("search_results_album_image");
            playlistImage.src = imgUrl;
        
            playlistImageContainer.appendChild(playlistImage);
        
            const playlistTextContainer = document.createElement("div");
            playlistTextContainer.classList.add("search_results_album_text");
        
            const playlistTitle = document.createElement("p");
            playlistTitle.classList.add("search_results_album_text_title");
            playlistTitle.innerHTML = playlistName;
        
            const plylistOwner = document.createElement("p");
            plylistOwner.classList.add("search_results_album_text_type");
            plylistOwner.innerHTML = PLAYLIST_OWNER;
        
            playlistTextContainer.appendChild(playlistTitle);
            playlistTextContainer.appendChild(plylistOwner);
        
            playlistContainer.appendChild(playlistImageContainer);
            playlistContainer.appendChild(playlistTextContainer);

            playlistResultContainer.appendChild(playlistContainer);
        }

        CONTAINER.appendChild(headerContainer);
        CONTAINER.appendChild(playlistResultContainer);
    }

    async #addSongContextMenu(elem, SONG_DATA) {
        const PLAYLIST_SUBMENU = await this.#getPlaylistSubMenu();

        const CONTEXT_DATA_TEST = [
            {
                title: "Play now",
                callback: this.menuPlayNowCallback.bind(this),
                subMenu: null
            },
            {
                title: "Play next",
                callback: this.menuPlayNextCallback.bind(this),
                subMenu: null
            },
            {
                title: "Download",
                callback: function() {
                    console.log("test");
                },
                subMenu: null
            },
            {
                title: "Like",
                callback: function() {
                    console.log("test");
                },
                subMenu: null
            },
            {
                title: "Open Artist",
                callback: this.menuOpenSingleArtistCallback.bind(this),
                subMenu: this.submenuGetArtistsCallback.bind(this), //will be shown if condition true
                conditionSubMenu: this.menuOpenArtistCondition.bind(this), //condition to show submenu
            },
            {
                title: "Open Album",
                callback: this.menuOpenAlbumCallback.bind(this),
                subMenu: null
            },
            {
                title: "Add to playlist",
                callback: function() {
                    console.log("test");
                },
                subMenu: PLAYLIST_SUBMENU
            }
        ]

        const that = this;

        elem.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            const CORD_X = e.clientX;
            const CORD_Y = e.clientY;
            const CONTEXT_MENU = new ContextMenu(CONTEXT_DATA_TEST, CORD_X, CORD_Y, this.#viewController);

            CONTEXT_MENU.show(SONG_DATA);
            
            that.#selectSong(elem);
        });
    }

    #selectSong(elem) {
        this.#selectedSongHTML = elem;
        elem.classList.add("track_selected");
        elem.getElementsByClassName("search_result_track_image")[0].classList.add("search_result_track_image_selected");
        this.#boundUnSelectSong = this.#unSelectSong.bind(this);
        this.#messageBroker.subscribe("closeContextMenu", this.#boundUnSelectSong);
    }

    #unSelectSong() {
        const SELECTED_SONG = this.#selectedSongHTML;
        SELECTED_SONG.classList.remove("track_selected");
        SELECTED_SONG.getElementsByClassName("search_result_track_image")[0].classList.remove("search_result_track_image_selected");
        this.#selectedSongHTML = null;
        this.#messageBroker.unsubscribe("closeContextMenu", this.#boundUnSelectSong);
    }

    async menuPlayNowCallback(data) {
        const queue = this.#viewController.getQueue();
        const player = this.#viewController.getPlayer();
        await queue.enqueue(data.id);
        player.playQueue();
    }

    async menuPlayNextCallback(data) {
        const queue = this.#viewController.getQueue();
        await queue.enqueue(data.id);
    }

    async menuOpenSingleArtistCallback(data) {
        const SONG_ARTIST_ARRAY = data.artists.items;
        const ARTIST_ID = SONG_ARTIST_ARRAY[0].uri.split(":")[2];

        this.#viewController.switchView("artist", ARTIST_ID);
    }

    async menuOpenSpecificArtist(artist) {
        const ARTIST_ID = artist.uri.split(":")[2];
        this.#viewController.switchView("artist", ARTIST_ID);
    }

    menuOpenArtistCondition(data) {
        const SONG_ARTIST_ARRAY = data.artists.items;
        const LENGTH = SONG_ARTIST_ARRAY.length;
        if (LENGTH > 1) {
            return true;
        }

        return false;
    }

    submenuGetArtistsCallback(data) {
        const songArtistArray = data.artists.items;
        const SUB_MENU_DATA = [];

        for (let i = 0; i < songArtistArray.length; i++) {
            const ARTIST_DATA = songArtistArray[i];
            const ARTIST_NAME = ARTIST_DATA.profile.name;
            const ARTIST_ID = ARTIST_DATA.uri.split(":")[2];
            SUB_MENU_DATA.push({
                title: ARTIST_NAME,
                callback: this.menuOpenSpecificArtist.bind(this, ARTIST_DATA)
            });
        }

        return SUB_MENU_DATA;
    }

    async menuOpenAlbumCallback(data) {
        const ALBUM_ID = data.albumOfTrack.id;

        this.#viewController.switchView("album", ALBUM_ID);
    }

    async #getPlaylistSubMenu() {
        const PLAYLISTS_DATA = await this.#messageBroker.pull("playlistsData");

        const SUB_MENU_DATA = [];

        SUB_MENU_DATA.push({
            title: "New playlist",
            callback: function(DATA) {
                console.log(DATA);
            }
        });

        for (let i = 0; i < PLAYLISTS_DATA.length; i++) {
            const PLAYLIST_DATA = PLAYLISTS_DATA[i];
            SUB_MENU_DATA.push({
                title: PLAYLIST_DATA.name,
                callback: this.#addToPlaylist.bind(this, PLAYLIST_DATA)
            });
        }

        return SUB_MENU_DATA;
    }

    async #addToPlaylist(PLAYLIST_DATA, SONG_DATA) {
        const SONG = await new SongNew(SONG_DATA);
        const id = SONG.getSongId();

        console.log(PLAYLIST_DATA);
        this.#messageBroker.publish("addToPlaylist", {
            playlistId: PLAYLIST_DATA.id,
            songId: id
        })
    }
}