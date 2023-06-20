class PlaylistView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #viewController = null
    #messageBroker = null
    #playlistData = null
    #headerPointers = null
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
        const that = this;
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
        this.#displayed = true;

        Sortable.create(playlist_songs_container, {
            animation: 150,
            group: "localStorage",
            store: {
                set: function (sortable) {
                    const NEW_ORDER = sortable.toArray();
                    const PLAYLIST_ID = that.#playlistData.playlistInfo.id;
                    updatePlaylist(PLAYLIST_ID, NEW_ORDER);
                    that.#updatePlaylistSorting(NEW_ORDER);
                    that.#updateHeaderImages(that.#playlistData);
                }       
            }
    
        });
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
        this.#playlistData = data;
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#type = "playlist_view";
        
        const returnValues = this.createHTMLContainer('unbound', 'playlist_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        console.log(data);
        this.#createHeader(returnValues.contentContainer, data);
        this.#createPlaylistSongsContainer(returnValues.contentContainer, data);
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

    #createPlaylistInfoString(songs) {
        let duration = 0;
        let nrSongs = 0;
        for (const SONG in songs) {
            const SONG_INFO = JSON.parse(songs[SONG].info);
            const DURATION_MS = SONG_INFO.songDuration;
            duration += DURATION_MS;
            nrSongs++;
        }

        const DURATION_STRING = msToTimeString(duration);
        return `${nrSongs} songs, ${DURATION_STRING}`;
    }
      
    #updatePlaylistSorting(newOrder) {
        const songList = this.#playlistData.songs;
        const songMap = {};
      
        // Create a hash table mapping each song ID to its corresponding song object
        for (const song of songList) {
          songMap[song.id] = song;
        }
      
        // Iterate through the new order and add the corresponding song objects to the new song list
        const newSongList = newOrder.map((songId) => songMap[songId]);
      
        this.#playlistData.songs = newSongList;
    }

    #updateHeaderImages(data) {
        const SONG_DATA = data.songs;
        const IMAGE_CONTAINERS = this.#createPlaylistImageContainers(data);
        const HEADER_CONTAINER = this.#headerPointers.headerContainer;
        const TEXT_CONTAINER = this.#headerPointers.textContainer;

        HEADER_CONTAINER.innerHTML = '';
        HEADER_CONTAINER.appendChild(IMAGE_CONTAINERS.backgroundImageContainer);
        HEADER_CONTAINER.appendChild(IMAGE_CONTAINERS.imageContainer);
        HEADER_CONTAINER.appendChild(TEXT_CONTAINER);
    }

    //html creation methods

    #createHeader(contentContainer, data) {
        const NAME = data.playlistInfo.name;
        const AUTHOR = data.playlistInfo.author;
        const IMAGE_CONTAINERS = this.#createPlaylistImageContainers(data);
        const PLAYLIST_INFO_STRING = this.#createPlaylistInfoString(data.songs);
        const BUTTON_CONTAINER = this.#createButtonContainer();

        const headerContainer = document.createElement('div');
        headerContainer.setAttribute('id', 'playlist_header_container');

        const backgroundImageContainer = IMAGE_CONTAINERS.backgroundImageContainer;

        const backgroundImageGradient = document.createElement('div');
        backgroundImageGradient.setAttribute('id', 'playlist_background_image_gradient');
        backgroundImageContainer.appendChild(backgroundImageGradient);

        const foregroundImageContainer = IMAGE_CONTAINERS.imageContainer;

        const textContainer = document.createElement('div');
        textContainer.setAttribute('id', 'playlist_text_container');

        const nameText = document.createElement('h2');
        nameText.setAttribute('id', 'playlist_name_text');
        nameText.setAttribute('contenteditable', 'true');
        nameText.innerHTML = NAME;
        nameText.onblur = () => {
            const NEW_NAME = nameText.innerHTML;
            const PLAYLIST_ID = data.playlistInfo.id;
            changePlaylistName(PLAYLIST_ID, NEW_NAME);
        };

        const autorText = document.createElement('p');
        autorText.setAttribute('id', 'playlist_author_text');
        autorText.innerHTML = "by " + AUTHOR;

        const durationText = document.createElement('p');
        durationText.setAttribute('id', 'playlist_duration_text');
        durationText.innerHTML = PLAYLIST_INFO_STRING;

        textContainer.appendChild(nameText);
        textContainer.appendChild(autorText);
        textContainer.appendChild(durationText);
        textContainer.appendChild(BUTTON_CONTAINER);

        headerContainer.appendChild(backgroundImageContainer);
        headerContainer.appendChild(foregroundImageContainer);
        headerContainer.appendChild(textContainer);

        contentContainer.appendChild(headerContainer);

        this.#headerPointers = {
            headerContainer : headerContainer,
            textContainer : textContainer
        };
    }

    #createPlaylistImageContainers(data) {
        const PLAYLIST_IMAGE_URLS = data.playlistInfo.imageUrl;
        const PLAYLIST_IMAGE_ARRAY = PLAYLIST_IMAGE_URLS.split(',');
        const SONGS_DATA = data.songs;

        if (SONGS_DATA.length >= 4) {
            return this.#createQuadImageContainers(data);
        }

        const PLAYLIST_IMAGE_URL = data.playlistInfo.imageUrl;

        if (PLAYLIST_IMAGE_ARRAY.length == 4) {
            const PLAYLIST_ID = this.#playlistData.playlistInfo.id;
            changePlaylistImage(PLAYLIST_ID, PLAYLIST_IMAGE_URL)
        }

        const imageContainer = document.createElement('div');
        imageContainer.setAttribute('id', 'playlist_image_container');

        const image = document.createElement('img');
        image.setAttribute('id', 'playlist_image');
        image.src = PLAYLIST_IMAGE_URL;

        imageContainer.appendChild(image);

        
        const backgroundImageContainer = document.createElement('div');
        backgroundImageContainer.setAttribute('id', 'playlist_background_image_container');
        
        const backgroundImage = document.createElement('img');
        backgroundImage.setAttribute('id', 'playlist_background_image');
        backgroundImage.src = PLAYLIST_IMAGE_URLS;

        backgroundImageContainer.appendChild(backgroundImage);

        return {
            imageContainer: imageContainer,
            backgroundImageContainer: backgroundImageContainer
        }
    }

    #createQuadImageContainers(data) {
        const PLAYLIST_IMAGE_URLS = data.playlistInfo.imageUrl;
        const PLAYLIST_IMAGE_ARRAY = PLAYLIST_IMAGE_URLS.split(',');
        const SONG_DATA = data.songs;
        const SONG_IMAGES = [];

        const plalistQuadImageOuterContainer = document.createElement('div');
        plalistQuadImageOuterContainer.setAttribute('id', 'playlist_quad_image_outer_container');

        const playlistQuadImageContainer = document.createElement('div');
        playlistQuadImageContainer.setAttribute('id', 'playlist_quad_image_container');
        

        const plalistQuadImageBackgroundContainer = document.createElement('div');
        plalistQuadImageBackgroundContainer.setAttribute('id', 'playlist_quad_image_background_container');

        for (let i = 0; i < 4; i++) {
            const SongData = SONG_DATA[i];
            const SONG_INFO = JSON.parse(SongData.info);
            const SONG_IMAGE_URL = SONG_INFO.songImageUrl;
            SONG_IMAGES.push(SONG_IMAGE_URL);

            const songImage = document.createElement('img');
            songImage.setAttribute('class', 'playlist_quad_image');
            songImage.src = SONG_IMAGE_URL
            
            const songImageBackground = document.createElement('img');
            songImageBackground.setAttribute('class', 'playlist_quad_image_background');
            songImageBackground.src = SONG_IMAGE_URL;


            playlistQuadImageContainer.appendChild(songImage);
            plalistQuadImageBackgroundContainer.appendChild(songImageBackground);
            plalistQuadImageOuterContainer.appendChild(playlistQuadImageContainer);
        }

        if (PLAYLIST_IMAGE_ARRAY.length != 4) {
            const SONG_IMAGE_STRING = SONG_IMAGES.join(',');
            const PLAYLIST_ID = this.#playlistData.playlistInfo.id;
            changePlaylistImage(PLAYLIST_ID, SONG_IMAGE_STRING)
        }

        return {
            imageContainer: plalistQuadImageOuterContainer,
            backgroundImageContainer: plalistQuadImageBackgroundContainer
        }
    }

    #createPlaylistSongsContainer(contentContainer, data) {
        const SONGS_DATA = data.songs;

        const playlistSongsContainer = document.createElement('div');
        playlistSongsContainer.setAttribute('id', 'playlist_songs_container');
        playlistSongsContainer.setAttribute('class', 'tracks_container');

        for (let i = 0; i < SONGS_DATA.length; i++) {
            const SONG_DATA = SONGS_DATA[i];
            const SONG_INFO = JSON.parse(SONG_DATA.info);
            const SONG_NAME = SONG_INFO.songTitle;
            const SONG_ID = SONG_DATA.id;
            const SONG_ARTIST_ARRAY = JSON.parse(SONG_INFO.songArtistArray);
            const SONG_ARTIST_STRING = getArtistsAsString(SONG_ARTIST_ARRAY.items)
            const SONG_IMAGE_URL = SONG_INFO.songImageUrl;
            const SONG_DURATION = SONG_INFO.songDuration;
            const SONG_DURATION_STRING = getTrackLengthFromMS(SONG_DURATION)

            const trackItem = document.createElement('div');
            trackItem.setAttribute('class', 'track_item');
            trackItem.setAttribute("data-id", SONG_ID);

            const trackSpacerLeft = document.createElement('div');
            trackSpacerLeft.setAttribute('class', 'track_spacer_left');

            const trackImageContainer = document.createElement('div');
            trackImageContainer.setAttribute('class', 'track_image_container');

            const trackImage = document.createElement('img');
            trackImage.setAttribute('class', 'track_image');
            trackImage.src = SONG_IMAGE_URL;

            const songNameHTML = document.createElement('p');
            songNameHTML.setAttribute('class', 'track_text_left');
            songNameHTML.innerHTML = SONG_NAME;

            const songArtistHTML = document.createElement('p');
            songArtistHTML.setAttribute('class', 'track_text_middle');
            songArtistHTML.innerHTML = SONG_ARTIST_STRING;

            const songDurationHTML = document.createElement('p');
            songDurationHTML.setAttribute('class', 'track_text_right');
            songDurationHTML.innerHTML = SONG_DURATION_STRING;

            trackImageContainer.appendChild(trackImage);

            trackItem.appendChild(trackSpacerLeft);
            trackItem.appendChild(trackImageContainer);
            trackItem.appendChild(songNameHTML);
            trackItem.appendChild(songArtistHTML);
            trackItem.appendChild(songDurationHTML);

            this.#addSongContextMenu(trackItem, SONG_DATA);

            playlistSongsContainer.appendChild(trackItem);
        }

        contentContainer.appendChild(playlistSongsContainer);
    }

    #createButtonContainer() {
        const buttonContainer = document.createElement('div');
        buttonContainer.setAttribute('id', 'button_container');

        const playButtonContainer = document.createElement('div');
        playButtonContainer.setAttribute('class', 'playlist_button_container');

        const playButton = document.createElement('p');
        playButton.setAttribute('class', 'playlist_button');
        playButton.innerHTML = 'Play';

        const shuffleButtonContainer = document.createElement('div');
        shuffleButtonContainer.setAttribute('class', 'playlist_button_container');

        const shuffleButton = document.createElement('p');
        shuffleButton.setAttribute('class', 'playlist_button');
        shuffleButton.innerHTML = 'Shuffle';

        playButtonContainer.appendChild(playButton);
        shuffleButtonContainer.appendChild(shuffleButton);

        buttonContainer.appendChild(playButtonContainer);
        buttonContainer.appendChild(shuffleButtonContainer);

        return buttonContainer;
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
            },
            {
                title: "Remove from Playlist",
                callback: function() {
                    console.log("test");
                },
                subMenu: null
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
        elem.getElementsByClassName("track_image")[0].classList.add("track_image_selected");
        this.#boundUnSelectSong = this.#unSelectSong.bind(this);
        this.#messageBroker.subscribe("closeContextMenu", this.#boundUnSelectSong);
    }

    #unSelectSong() {
        const SELECTED_SONG = this.#selectedSongHTML;
        SELECTED_SONG.classList.remove("track_selected");
        SELECTED_SONG.getElementsByClassName("track_image")[0].classList.remove("track_image_selected");
        this.#selectedSongHTML = null;
        this.#messageBroker.unsubscribe("closeContextMenu", this.#boundUnSelectSong);
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
                callback: function(DATA) {
                    console.log(DATA);
                }
            });
        }

        return SUB_MENU_DATA;
    }

    submenuGetArtistsCallback(data) {
        const SONGINFO = JSON.parse(data.info);        
        const songArtistArray = JSON.parse(SONGINFO.songArtistArray).items;
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

    //menu callback functions

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

    async menuDownloadCallback(data) {
        //TODO: download
    }

    async menuLikeCallback(data) {
        //TODO: like
    }
    
    async menuOpenSingleArtistCallback(data) {
        const SONGINFO = JSON.parse(data.info);
        const SONG_ARTIST_ARRAY = JSON.parse(SONGINFO.songArtistArray).items;
        const ARTIST_ID = SONG_ARTIST_ARRAY[0].uri.split(":")[2];

        this.#viewController.switchView("artist", ARTIST_ID);
    }

    async menuOpenSpecificArtist(artist) {
        const ARTIST_ID = artist.uri.split(":")[2];
        this.#viewController.switchView("artist", ARTIST_ID);
    }

    menuOpenArtistCondition(data) {
        const SONGINFO = JSON.parse(data.info);
        const SONG_ARTIST_ARRAY = JSON.parse(SONGINFO.songArtistArray).items;
        const LENGTH = SONG_ARTIST_ARRAY.length;
        if (LENGTH > 1) {
            return true;
        }

        return false;
    }

    async menuOpenAlbumCallback(data) {
        const SONGINFO = JSON.parse(data.info);
        const ALBUM_ID = SONGINFO.songAlbum.uri.split(":")[2];

        this.#viewController.switchView("album", ALBUM_ID);
    }

    async menuAddToPlaylistCallback(data) {
        //TODO: add to playlist
    }

    async menuRemoveFromPlaylistCallback(data) {
        //TODO: remove from playlist
    }

}