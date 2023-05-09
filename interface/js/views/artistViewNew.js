class ArtistView extends View {
    #viewHTML = null; //the HTML container for the view.
    #type = null; //the type of view
    #HTMLContent = null; //the HTML container that contains all the views content (excluding title)
    #displayed = false
    #viewController = null
    #HTMLPointers = null;
    #artistData = null;
    #carouselWidth = 1200;
    #carouselControls = [];
    #resizeUpdate = null
    #messageBroker = null

    constructor(data, viewController) {
        super();
        return this.#constructorMethod(data, viewController);
    }

    //implemeneted methods

    /**
     * This method fetches the artists metadata from the spotify API and creates the corresponding view.
     * @param {Object} data - The data to be used for the construction. (useless here)
     */
    async #constructorMethod(data, viewController) {
        const CHECK = await this.#checkIfIdExists(data)
        if (CHECK != true) {
            data = await getSpotifyArtist(CHECK)
        }
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
        this.#messageBroker.subscribe("resize", this.#resizeUpdate.bind(this))
    }

    /**
     * Clears the viewport.
     */
    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        this.#displayed = false
        this.#messageBroker.unsubscribe("resize", this.#resizeUpdate.bind(this))
    }

    /**
     * Creates a view with the given type and data.
     * 
     * @async
     * @param {Object} data - The data to use in the view.
     */
    async #createView(data, viewController) {
        this.#type = "artist_view";
        this.#artistData = data
        this.#viewController = viewController
        this.#messageBroker = viewController.getMessageBroker()

        const RETURN_VALUES = this.createHTMLContainer("unbound", 'artist_view');
        this.#viewHTML = RETURN_VALUES.container
        this.#HTMLContent = RETURN_VALUES.contentContainer

        this.#spawnHTMLArtistContent(RETURN_VALUES.contentContainer, data);

        const that = this
        this.#resizeUpdate = async function (e) {
            await that.#updateAlbumCarouselWidth();
        };
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

    async #loadImage(url, elem) {
        return new Promise((resolve, reject) => {
          elem.onload = () => resolve(elem);
          elem.onerror = reject;
          elem.src = url;
        });
    }

    async #checkIfIdExists(data) {
        if (data.id == undefined) {
            const id = getIdFromSongInfo(data)
            return id
        }
        return true
    }

    async #setCustomColors(elem, imageURL) {
        await this.#loadImage(imageURL, elem)
        const colorString = await getColors(elem)
        document.documentElement.style.setProperty("--accentColor", colorString);
    }

    #calcAppropriateAlbumCarouselWidth() {
        const ALBUM_WIDTH = 300;
        const CONTENT_WIDTH = window.innerWidth - 72; //60 for menuLeft, 12 for scrollbar (always visible on artistPage)
        const NR_ALBUMS = Math.floor((CONTENT_WIDTH - 50) / ALBUM_WIDTH);
        const CAROUSEL_WIDTH = ALBUM_WIDTH * NR_ALBUMS

        return {
            carouselWidth: CAROUSEL_WIDTH,
            nrAlbums: NR_ALBUMS
        }
    }

    async #updateAlbumCarouselWidth() {
        const NEW_DIMS = this.#calcAppropriateAlbumCarouselWidth();
        const OLD_CAROUSEL_WIDTH = this.#carouselWidth
        const NEW_CAROUSEL_WIDTH = NEW_DIMS.carouselWidth;
        if (OLD_CAROUSEL_WIDTH == NEW_CAROUSEL_WIDTH) {
            return
        }
        const CAROUSELS = this.#carouselControls;
        this.#carouselWidth = NEW_CAROUSEL_WIDTH
        const NR_ALBUMS_NEW = NEW_DIMS.nrAlbums

        for (let i = 0; i < CAROUSELS.length; i++) {
            const CAROUSEL_OBJECT = CAROUSELS[i];
            const CAROUSEL = CAROUSEL_OBJECT.carousel;
            const CAROUSEL_NAVIGATOR_OBJECT = CAROUSEL_OBJECT.carouselNavigatorContainer;
            const ALBUMS = CAROUSEL_OBJECT.albums;
            const TITLE = CAROUSEL_OBJECT.title;
            CAROUSEL.style.width = `${NEW_CAROUSEL_WIDTH}px`;

            this.#createAlbumNavigator(CAROUSEL_NAVIGATOR_OBJECT, CAROUSEL, ALBUMS, NR_ALBUMS_NEW, TITLE);
        }
    }

    #setMenuTopHeading(name) {
        this.#viewController.getMenu().setTopHeading(name)
    }

    //html creation methods

    #spawnHTMLArtistContent(container, data) {
        this.#createBackgroundImage(container, data)
        this.#createHeaderContainer(container, data)
        this.#createMostPopularContent(container, data)
        this.#createAlbumsAndSingles(container, data)
        this.#createBiography(container, data)
    }

    #createBackgroundImage(container, data) {
        const ARTIST_BACKGROUND_IMAGE = 
        data.visuals.headerImage?.sources[0].url || 
        data.visuals.avatarImage?.sources[0].url || 
        "standardImages/bgArtist.jpg";

        const backgroundImageContainer = document.createElement('div');
        backgroundImageContainer.setAttribute("id", "artist_background_image_container");

        const backgroundImage = document.createElement('img');
        backgroundImage.setAttribute("id", "artist_background_image");
        backgroundImage.src = ARTIST_BACKGROUND_IMAGE;

        backgroundImageContainer.appendChild(backgroundImage);

        container.appendChild(backgroundImageContainer);
    }

    async #createHeaderContainer(container, data) {
        const ARTIST_NAME = data.profile.name
        const ARTIST_BACKGROUND_IMAGE = 
            data.visuals.headerImage?.sources[0].url || 
            data.visuals.avatarImage?.sources[0].url || 
            "standardImages/bgArtist.jpg";

        this.#setMenuTopHeading(ARTIST_NAME)
        
        const headerContainer = document.createElement('div');
        headerContainer.setAttribute("id", "artist_header_container");

        const headerImage = document.createElement('img');
        headerImage.setAttribute("id", "artist_header_image");
        this.#setCustomColors(headerImage, ARTIST_BACKGROUND_IMAGE);

        const headerGradient = document.createElement('div');
        headerGradient.setAttribute("id", "artist_header_gradient");

        const headerTextContainer = document.createElement('div');
        headerTextContainer.setAttribute("id", "artist_header_text_container");

        const headerText = document.createElement('h1');
        headerText.setAttribute("id", "artist_header_text");
        headerText.innerHTML = ARTIST_NAME;

        const headerPlayButton = document.createElement('div');
        headerPlayButton.setAttribute("class", "artist_header_button");
        headerPlayButton.addEventListener("click", () => {
            //TODO play
        })

        const headerPlayButtonIcon = document.createElement('img');
        headerPlayButtonIcon.setAttribute("class", "artist_header_button_icon");
        headerPlayButtonIcon.src = "icons/play/play.svg"

        const headerFollowButton = document.createElement('div');
        headerFollowButton.setAttribute("class", "artist_header_button");
        headerFollowButton.addEventListener("click", () => {
            //TODO follow
        })

        const headerFollowButtonIcon = document.createElement('img');
        headerFollowButtonIcon.setAttribute("class", "artist_header_button_icon");
        headerFollowButtonIcon.src = "icons/bell/bell.svg"

        headerPlayButton.appendChild(headerPlayButtonIcon);

        headerFollowButton.appendChild(headerFollowButtonIcon);

        headerTextContainer.appendChild(headerText);
        headerTextContainer.appendChild(headerPlayButton);
        headerTextContainer.appendChild(headerFollowButton);

        headerContainer.appendChild(headerImage);
        headerContainer.appendChild(headerGradient);
        headerContainer.appendChild(headerTextContainer);

        container.appendChild(headerContainer);

    }

    async #createMostPopularContent(container, data) {
        const LATEST_RELEASE = data.discography.latest

        const mostPopularContainer = document.createElement('div');
        mostPopularContainer.setAttribute("id", "artist_most_popular_container");

        const popularSongsContainer = document.createElement('div');

        if (LATEST_RELEASE !== null) {
            const lastReleaseContainer = document.createElement('div');
            lastReleaseContainer.setAttribute("id", "artist_last_release_container");

            this.#createLatestRelease(lastReleaseContainer, LATEST_RELEASE);

            mostPopularContainer.appendChild(lastReleaseContainer);

            const divider = document.createElement('div');
            divider.setAttribute("id", "artist_most_popular_divider");

            mostPopularContainer.appendChild(divider);

            popularSongsContainer.setAttribute("id", "artist_popular_songs_container");
            this.#createPopularSongs(popularSongsContainer, data, "small");
        } else {
            popularSongsContainer.setAttribute("id", "artist_popular_songs_container_full");
            this.#createPopularSongs(popularSongsContainer, data, "full");
        }


        mostPopularContainer.appendChild(popularSongsContainer);

        container.appendChild(mostPopularContainer);
    }

    #createLatestRelease(container, data) {
        const NAME = data.name
        const NR_TRACKS = data.tracks.totalCount
        const SONG_NUMBER = NR_TRACKS == 1 ? "1 Song" : NR_TRACKS + " Songs";
        const TYPE_ALBUM = data.type
        const RELEASE_DATE = data.date.year
        const IMAGE_URL = data.coverArt.sources[0]?.url || "standardImages/cover.jpg"

        const latestReleaseWrapper = document.createElement('div');
        latestReleaseWrapper.setAttribute("id", "artist_latest_release_wrapper");

        const latestReleaseTitleContainer = document.createElement('div');
        latestReleaseTitleContainer.setAttribute("id", "artist_latest_release_title_container");

        const latestReleaseTitle = document.createElement('h2');
        latestReleaseTitle.setAttribute("id", "artist_latest_release_title");
        latestReleaseTitle.innerHTML = "Latest Release";

        const latestReleaseContentContainer = document.createElement('div');
        latestReleaseContentContainer.setAttribute("id", "artist_latest_release_content_container");

        const latestReleaseContent = document.createElement('div');
        latestReleaseContent.setAttribute("id", "artist_latest_release_content");

        const latestReleaseImageContainer = document.createElement('div');
        latestReleaseImageContainer.setAttribute("id", "artist_latest_release_image_container");

        const latestReleaseImage = document.createElement('img');
        latestReleaseImage.setAttribute("id", "artist_latest_release_image");
        latestReleaseImage.src = IMAGE_URL

        const latestReleaseTextContainer = document.createElement('div');
        latestReleaseTextContainer.setAttribute("id", "artist_latest_release_text_container");

        const latestReleaseTextName = document.createElement('h3');
        latestReleaseTextName.setAttribute("id", "artist_latest_release_text_name");
        latestReleaseTextName.innerHTML = NAME

        const latestReleaseTextNrSongs = document.createElement('p');
        latestReleaseTextNrSongs.setAttribute("id", "artist_latest_release_text_nr_songs");
        latestReleaseTextNrSongs.innerHTML = SONG_NUMBER

        const latestReleaseTextDate = document.createElement('p');
        latestReleaseTextDate.setAttribute("id", "artist_latest_release_text_date");
        latestReleaseTextDate.innerHTML = RELEASE_DATE

        latestReleaseTextContainer.appendChild(latestReleaseTextName);
        latestReleaseTextContainer.appendChild(latestReleaseTextNrSongs);
        latestReleaseTextContainer.appendChild(latestReleaseTextDate);

        latestReleaseImageContainer.appendChild(latestReleaseImage);

        latestReleaseContent.appendChild(latestReleaseImageContainer);
        latestReleaseContent.appendChild(latestReleaseTextContainer);

        latestReleaseTitleContainer.appendChild(latestReleaseTitle);

        latestReleaseContentContainer.appendChild(latestReleaseContent);

        latestReleaseWrapper.appendChild(latestReleaseTitleContainer);
        latestReleaseWrapper.appendChild(latestReleaseContentContainer);

        container.appendChild(latestReleaseWrapper);
    }

    #createPopularSongs(container, data, size) {
        const TOP_SONGS = data.discography.topTracks?.items || []
        const MAX_LENGTH = size == "small" ? 6 : 9;
        const REAL_LENGTH = TOP_SONGS.length > MAX_LENGTH ? MAX_LENGTH : TOP_SONGS.length;

        const popularSongsWrapper = document.createElement('div');
        popularSongsWrapper.setAttribute("id", "artist_popular_songs_wrapper");

        const popularSongsTitleContainer = document.createElement('div');
        popularSongsTitleContainer.setAttribute("id", "artist_popular_songs_title_container");

        const popularSongsTitle = document.createElement('h2');
        popularSongsTitle.setAttribute("id", "artist_popular_songs_title");
        popularSongsTitle.innerHTML = "Popular Songs";

        const songsContainer = document.createElement('div');
        const songContainerID = size == "small" ? "artist_grid_songs_container" : "artist_grid_songs_container_full";
        songsContainer.setAttribute("id", songContainerID);

        popularSongsTitleContainer.appendChild(popularSongsTitle);

        for (let i = 0; i < REAL_LENGTH; i++) {
            const TOP_SONG_DATA = TOP_SONGS[i].track;
            const SONG_ID = TOP_SONG_DATA.id;
            const SONG_NAME = TOP_SONG_DATA.name;
            const SONG_ARTISTS_STRING = getArtistsAsString(TOP_SONG_DATA.artists.items);
            const SONG_IMAGE_URL = getImageCoverUrl(TOP_SONG_DATA);

            const songContainer = document.createElement('div');
            songContainer.setAttribute("class", "artist_grid_song_container");

            const songImageContainer = document.createElement('div');
            songImageContainer.setAttribute("class", "artist_grid_song_image_container");

            const songImage = document.createElement('img');
            songImage.setAttribute("class", "artist_grid_song_image");
            songImage.src = SONG_IMAGE_URL

            const songTextContainer = document.createElement('div');
            songTextContainer.setAttribute("class", "artist_grid_song_text_container");

            const songTextName = document.createElement('h3');
            songTextName.setAttribute("class", "artist_grid_song_text_name");
            songTextName.innerHTML = SONG_NAME

            const songTextArtists = document.createElement('p');
            songTextArtists.setAttribute("class", "artist_grid_song_text_artists");
            songTextArtists.innerHTML = SONG_ARTISTS_STRING

            songImageContainer.appendChild(songImage);

            songTextContainer.appendChild(songTextName);
            songTextContainer.appendChild(songTextArtists);

            songContainer.appendChild(songImageContainer);
            songContainer.appendChild(songTextContainer);

            songsContainer.appendChild(songContainer);
        }

        popularSongsWrapper.appendChild(popularSongsTitleContainer);
        popularSongsWrapper.appendChild(songsContainer);

        container.appendChild(popularSongsWrapper);
    }

    #createAlbumsAndSingles(container, data) {
        const ALBUMS = data.discography.albums.items
        if (ALBUMS.length != 0){
            this.#createAlbumCarousel(container, ALBUMS, "Albums")
        }

        const SINGLES = data.discography.singles.items
        if (SINGLES.length != 0){
            this.#createAlbumCarousel(container, SINGLES, "Singles")
        }
    }

    #createAlbumCarousel(container, albums, title) {
        const DIMS = this.#calcAppropriateAlbumCarouselWidth()
        const CAROUSEL_WIDTH = DIMS.carouselWidth
        const NR_ALBUMS_SHOWN = DIMS.nrAlbums

        const albumsContainer = document.createElement('div');
        albumsContainer.setAttribute("class", "artist_albums_container");

        const albumsTitleContainer = document.createElement('div');
        albumsTitleContainer.setAttribute("class", "artist_albums_title_container");

        const albumsTitle = document.createElement('h2');
        albumsTitle.setAttribute("class", "artist_albums_title");
        albumsTitle.innerHTML = title

        const albumsCarousel = document.createElement('div');
        albumsCarousel.setAttribute("class", "artist_albums_carousel");
        albumsCarousel.style.width = `${CAROUSEL_WIDTH}px`

        for (let i = 0; i < albums.length; i++) {
            const ALBUM = albums[i].releases.items[0];
            let NAME = ALBUM.name;
            const RELEASE_DATE = ALBUM.date.year;
            const IMAGE_URL = ALBUM.coverArt.sources[0].url;
            
            if (NAME.length > 15) {
                NAME = NAME.substring(0, 15) + "...";
            }

            const albumContainer = document.createElement('div');
            albumContainer.setAttribute("class", "artist_album_container");

            const albumInnerContainer = document.createElement('div');
            albumInnerContainer.setAttribute("class", "artist_album_inner_container");

            const albumImageContainer = document.createElement('div');
            albumImageContainer.setAttribute("class", "artist_album_image_container");

            const albumImage = document.createElement('img');
            albumImage.setAttribute("class", "artist_album_image");
            albumImage.src = IMAGE_URL

            const albumName = document.createElement('p');
            albumName.setAttribute("class", "artist_album_name");
            albumName.innerHTML = NAME

            const albumDate = document.createElement('p');
            albumDate.setAttribute("class", "artist_album_date");
            albumDate.innerHTML = RELEASE_DATE

            albumImageContainer.appendChild(albumImage);

            albumInnerContainer.appendChild(albumImageContainer);
            albumInnerContainer.appendChild(albumName);
            albumInnerContainer.appendChild(albumDate);

            albumContainer.appendChild(albumInnerContainer);

            albumsCarousel.appendChild(albumContainer);
        }

        const carouselNavigatorContainer = document.createElement('div');
        carouselNavigatorContainer.setAttribute("class", "artist_album_navigator_container");

        this.#createAlbumNavigator(carouselNavigatorContainer, albumsCarousel, albums, NR_ALBUMS_SHOWN, title)

        albumsTitleContainer.appendChild(albumsTitle);

        albumsContainer.appendChild(albumsTitleContainer);
        albumsContainer.appendChild(albumsCarousel);
        albumsContainer.appendChild(carouselNavigatorContainer);

        container.appendChild(albumsContainer);

        this.#carouselControls.push({
            carousel: albumsCarousel,
            carouselNavigatorContainer: carouselNavigatorContainer,
            albums: albums,
            title: title
        })


    }

    #createAlbumNavigator(container, target, albums, appropriateNrAlbumsCarousel, title) {
        const WIDTH_SMALL_NAVIGATOR_INCREMENT = 80 / appropriateNrAlbumsCarousel;
        const NR_BIG_NAVIGATORS = Math.floor(albums.length / appropriateNrAlbumsCarousel);
        const SMALL_NAVIGATORS_INCREMENTS = albums.length - (NR_BIG_NAVIGATORS * appropriateNrAlbumsCarousel);
        const SMALL_NAVIGATOR_WIDTH = WIDTH_SMALL_NAVIGATOR_INCREMENT * SMALL_NAVIGATORS_INCREMENTS;
        const SMALL_NAVIGATOR_WIDTH_HOVER = SMALL_NAVIGATOR_WIDTH * 1.4;

        container.innerHTML = "";
    
        for (let i = 0; i < NR_BIG_NAVIGATORS; i++) {
            const bigNavigator = document.createElement('div');
            bigNavigator.setAttribute("class", "artist_album_navigator");
    
            bigNavigator.addEventListener("click", function () {
                const SCROLL_WIDTH = 300 * appropriateNrAlbumsCarousel * i;
                target.scrollTo({ left: SCROLL_WIDTH, behavior: "smooth" });
            });
    
            container.appendChild(bigNavigator);
        }
    
        if (SMALL_NAVIGATORS_INCREMENTS > 0) {1
            const smallNavigator = document.createElement('div');
            smallNavigator.setAttribute("class", "artist_album_navigator");
            const id = "artist_smallNavigator" + title;
            smallNavigator.setAttribute("id", id);
            const CSS = 
                `
                #${id} {
                    width: ${SMALL_NAVIGATOR_WIDTH}px;
                }
                
                #${id}:hover {
                    width: ${SMALL_NAVIGATOR_WIDTH_HOVER}px;
                }
            `
            const style = document.createElement('style');
            if (style.styleSheet) {
                style.styleSheet.cssText = CSS;
            } else {
                style.appendChild(document.createTextNode(CSS));
            }
            document.head.appendChild(style);
    
            smallNavigator.addEventListener("click", function () {
                target.scrollTo({ left: 100000, behavior: "smooth" });
            });

            container.appendChild(smallNavigator);
        }
    }

    #createBiography(container, data) {
        const BIO_TEXT = data.profile.biography?.text || null;
        const IMAGES = data.visuals.gallery?.items || null;

        if (BIO_TEXT == null && IMAGES == null) {
            return;
        }

        const biographyContainer = document.createElement('div');
        biographyContainer.setAttribute("class", "artist_biography_container");

        if (BIO_TEXT != null) {
            this.#createBiographyText(biographyContainer, BIO_TEXT);
        }

        container.appendChild(biographyContainer);
    }

    #createBiographyText(container, bioText) {
        const bioTextContainer = document.createElement('div');
        bioTextContainer.setAttribute("class", "artist_biography_text_container");
        const SPLIT_ARRAY = bioText.split("<a");

        for (let i = 0; i < SPLIT_ARRAY.length; i++) {
            const SPLIT_STRING = SPLIT_ARRAY[i];
            const SPLIT2 = SPLIT_STRING.split("</a>");
            const LINK_PART = SPLIT2[0];
            const REMAINING_TEXT = SPLIT2[1];
            const BUTTON = this.#getReplacementTag(LINK_PART);

            if (i == 0) {
                const textContainer = document.createElement('span')
                textContainer.innerHTML = LINK_PART;
                bioTextContainer.appendChild(textContainer);
            } else {
                bioTextContainer.appendChild(BUTTON);
                const textContainer = document.createElement('span')
                textContainer.innerHTML = REMAINING_TEXT;
                bioTextContainer.appendChild(textContainer);
            }
        }
        container.appendChild(bioTextContainer);
    }

    #getReplacementTag(str) {
        const FIRST_QUOTATION_MARK = str.indexOf('"') + 1;
        const SECOND_QUOTATION_MARK = nth_ocurrence(str, '"', 2);
        const SPOTIFY_ID = str
          .substring(FIRST_QUOTATION_MARK, SECOND_QUOTATION_MARK)
          .split(":")[2];
      
        const FIRST_OCCURRENCE = str.indexOf(">") + 1;
        const NAME = str.substring(FIRST_OCCURRENCE, str.length);  

        const button = document.createElement('div');
        button.setAttribute("class", "artist_biography_button");
        button.innerHTML = NAME
        button.addEventListener("click", function () {
            console.log(SPOTIFY_ID)
        })

        return button;
      }

}

