class SearchView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #HTMLPointers = null;
    #viewController = null;

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
        const that = this


        //change this so that the message broker has the listener and
        //this object subscribes to be notified instead.
        //This way, only one search view recieves the updates and
        //the search state can be preserved for undo 
        //the input in the menu search would need to be restored as well
        window.electronAPI.updateSpotifySearch((event, response) => {
            const result = response.data.searchV2
            console.log(result)
            that.#populateContent(result)
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
    async #createView(data, viewController) {
        this.#type = "search_view";
        this.#viewController = viewController

        const returnValues = this.createHTMLContainer(null, 'search_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        this.#createHTMLContainers(returnValues.contentContainer)

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

    #openSearchList(position) {
        const query = document.getElementById("top_search_input").value;
        const data = {
            position: position,
            query: query
        }
        this.#viewController.switchView("searchList", data)
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
        const artists = content.artists;
        const songs = content.tracksV2;
        const albums = content.albums;
        const playlists = content.playlists;

        this.#setHightlightContent(artists);
        this.#setArtistsContent(artists);
        this.#setSongsContent(songs);
        this.#setAlbumsContent(albums);
        this.#setPlaylistsContent(playlists);
    }

    /**
     * Sets the highlighted content based on the given content.
     * @param {Object} content - the content object parameter that contains the data to be displayed 
     */
    #setHightlightContent(content) {
        const container = this.#HTMLPointers.mostRelevantContainer
        container.innerHTML = '';
        const data = content["items"]["0"]["data"];
        const artistName = data["profile"]["name"];
        const artistNameLength = artistName.length;
        const spotifyURI = data["uri"];
        const spotifyId = spotifyURI.replace("spotify:artist:", "");

        const avatarImage = data["visuals"]["avatarImage"];
        const url = avatarImage?.["sources"]["0"]["url"] ?? "standardImages/cover.jpg";


        const hightlightHeading = document.createElement("h2");
        hightlightHeading.innerHTML = "Top Result";
        hightlightHeading.setAttribute("id", "search_most_relevant_result_heading");

        const hightlightContainer = document.createElement("div");
        hightlightContainer.setAttribute("id", "search_most_relevant_result_image_container");
        hightlightContainer.addEventListener("click", () => {
            //open artist
        })
        const hightlightImageDarkener = document.createElement("div");
        hightlightImageDarkener.setAttribute("id", "search_most_relevant_image_darkener");

        const hightlightImage = document.createElement("img");
        hightlightImage.setAttribute("id", "search_most_relevant_image");
        hightlightImage.src = url;

        const hightlightTextContainer = document.createElement("div");
        hightlightTextContainer.setAttribute("id", "search_most_relevant_result_image_heading_container");

        const hightlightText = document.createElement("p");
        hightlightText.setAttribute("id", "search_most_relevant_result_image_heading");
        hightlightText.innerHTML = artistName;
        
        if (artistNameLength > 10) {
            //clear class list of artistNameContainer
            hightlightText.classList.add("search_most_relevant_result_image_heading_small");
          } else {
            hightlightText.classList.add("search_most_relevant_result_image_heading_big");
          }

        hightlightTextContainer.appendChild(hightlightText);

        hightlightContainer.appendChild(hightlightImageDarkener);
        hightlightContainer.appendChild(hightlightImage);
        hightlightContainer.appendChild(hightlightTextContainer);

        container.appendChild(hightlightHeading);
        container.appendChild(hightlightContainer);
    }

    /**
     * Sets the content of the artist container with the given content.
     * @param {Object} content - The content to populate the container with. 
     */
    #setArtistsContent(content) {
        const container = this.#HTMLPointers.artistsContainer
        const that = this;
        container.innerHTML = '';
        const artists = content["items"];
        const length = 5;
        if (artists.length < length) length = artists.length;

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Artists";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList(0);
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const artistResultContainer = document.createElement("div");
        artistResultContainer.setAttribute("id", "search_results_artists");

        for (let i = 1; i < length; i++) {
            const artistData = artists[i]["data"];
            if (artistData == undefined) return;
            const spotifyURI = artistData["uri"];
            const spotifyId = spotifyURI.replace("spotify:artist:", "");
            let imageUrl = "standardImages/cover.jpg";
            if (artistData["visuals"]["avatarImage"] != null) {
                imageUrl = artistData["visuals"]["avatarImage"]["sources"][0]["url"];
              }
            const artistsName = artistData["profile"]["name"];

            const artistContainer = document.createElement("div");
            artistContainer.classList.add("search_results_artist");
            artistContainer.addEventListener("click", () => {
                //play track
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
            artistNameHTML.innerHTML = artistsName;
        
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

        container.appendChild(headerContainer);
        container.appendChild(artistResultContainer);

    }

    /**
     * Sets the content of the songs container with the given content object.
     * @param {Object} content - The content object containing an array of songs. 
     */
    #setSongsContent(content) {
        const container = this.#HTMLPointers.songsContainer
        container.innerHTML = '';
        const that = this;
        const songs = content["items"];

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Songs";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList(1);
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const songResultContainer = document.createElement("div");
        songResultContainer.setAttribute("id", "search_section_songs_result");

        const songLength = songs.length < 5 ? length = songs.length : length = 5

        for (let i = 0; i < songLength; i++) {
            const song = songs[i]['item']['data'];
            const songName = song["name"];
            const songId = song["id"];
            const songImageUrl = getImageCoverUrl(song)
            const artists = getArtistsAsString(song.artists.items);
            const trackTimeMS = song["duration"]["totalMilliseconds"];
            const trackTimeFormated = timeConvert(trackTimeMS);

            const songContainer = document.createElement("div");
            songContainer.classList.add("search_results_song");
            songContainer.addEventListener("click", () => {
                //play song
            })

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
            songImage.src = songImageUrl;

            songImageContainer.appendChild(songImage);
            songImageContainer.appendChild(currentlyPlayingContainer);

            const songTextContainer = document.createElement("div");
            songTextContainer.classList.add("search_results_song_text");

            const songTitle = document.createElement("p");
            songTitle.classList.add("search_results_song_text_title");
            songTitle.innerHTML = songName;

            const songArtist = document.createElement("p");
            songArtist.classList.add("search_results_song_text_artist");
            songArtist.innerHTML = artists;

            const songTime = document.createElement("p");
            songTime.classList.add("search_results_song_text_time");
            songTime.innerHTML = trackTimeFormated;

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
        const container = this.#HTMLPointers.albumsAndPlaylistsContainer
        const that = this;
        container.innerHTML = '';
        const albums = content["items"];

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Albums";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList(2);
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const albumResultContainer = document.createElement("div");
        albumResultContainer.setAttribute("id", "search_results_albums");

        const albumLength = albums.length < 5 ? length = albums.length : length = 5

        for (let i = 0; i < albumLength; i++) {
            const albumData = albums[i]["data"];
            const albumName = albumData["name"];
            const albumYear = albumData["date"]["year"];
            const albumImageUrl = albumData["coverArt"]["sources"][0]["url"]
            const artists = getArtistsAsString(albumData.artists.items);

            const albumContainer = document.createElement("div");
            albumContainer.classList.add("search_results_album");
            albumContainer.addEventListener("click", () => {
                //open album
            })
        
            const albumImageContainer = document.createElement("div");
            albumImageContainer.classList.add("search_results_album_image_container");
        
            const albumImage = document.createElement("img");
            albumImage.classList.add("search_results_album_image");
            albumImage.src = albumImageUrl;
        
            albumImageContainer.appendChild(albumImage);
        
            const albumTextContainer = document.createElement("div");
            albumTextContainer.classList.add("search_results_album_text");
        
            const albumTitle = document.createElement("p");
            albumTitle.classList.add("search_results_album_text_title");
            albumTitle.innerHTML = albumName;
        
            const albumYearHTML = document.createElement("p");
            albumYearHTML.classList.add("search_results_album_text_type");
            albumYearHTML.innerHTML = albumYear;
        
            albumTextContainer.appendChild(albumTitle);
            albumTextContainer.appendChild(albumYearHTML);
        
            albumContainer.appendChild(albumImageContainer);
            albumContainer.appendChild(albumTextContainer);

            albumResultContainer.appendChild(albumContainer);
        }

        container.appendChild(headerContainer);
        container.appendChild(albumResultContainer);
    }

    /**
     * Sets the content of the playlists container based on provided content.
     * @param {Object} content - Object containing playlist data
     */
    #setPlaylistsContent(content) {
        const container = this.#HTMLPointers.albumsAndPlaylistsContainer
        const playlists = content["items"];
        const that = this;

        const headerContainer = document.createElement("div");
        headerContainer.setAttribute("class", "search_results_heading_container");

        const header = document.createElement("h2");
        header.setAttribute("class", "search_results_heading");
        header.innerHTML = "Playlists";

        const buttonMore = document.createElement("img");
        buttonMore.src = "icons/more.svg";
        buttonMore.addEventListener("click", () => {
            that.#openSearchList(3);
        });

        headerContainer.appendChild(header);
        headerContainer.appendChild(buttonMore);

        const playlistResultContainer = document.createElement("div");
        playlistResultContainer.setAttribute("id", "search_results_playlists");

        const playlistLength = playlists.length < 5 ? length = playlists.length : length = 5

        for (let i = 0; i < playlistLength; i++) {
            const playlistData = playlists[i]["data"];
            let playlistName = playlistData["name"];
            if (playlistName == "") playlistName = "Untitled Playlist";
            const playlistOwner = playlistData["ownerV2"]["data"]["name"];
            var imgUrl = playlistData["images"]["items"]["0"]["sources"]["0"]["url"];
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
            plylistOwner.innerHTML = playlistOwner;
        
            playlistTextContainer.appendChild(playlistTitle);
            playlistTextContainer.appendChild(plylistOwner);
        
            playlistContainer.appendChild(playlistImageContainer);
            playlistContainer.appendChild(playlistTextContainer);

            playlistResultContainer.appendChild(playlistContainer);
        }

        container.appendChild(headerContainer);
        container.appendChild(playlistResultContainer);
    }
}