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
        const check = await this.#checkIfIdExists(data)
        if (check != true) {
            data = await getSpotifyArtist(check)
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
        window.addEventListener('resize', this.#resizeUpdate, false);
    }

    /**
     * Clears the viewport.
     */
    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        this.#displayed = false
        window.removeEventListener('resize', this.#resizeUpdate, false);
    }

    /**
     * Creates a view with the given type and data.
     * 
     * @async
     * @param {Object} data - The data to use in the view.
     */
    async #createView(data, viewController) {
        this.#type = "search_view";
        this.#artistData = data
        this.#viewController = viewController

        const returnValues = this.createHTMLContainer("unbound", 'artist_view');
        this.#viewHTML = returnValues.container
        this.#HTMLContent = returnValues.contentContainer

        this.#spawnHTMLArtistContent(returnValues.contentContainer, data);

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
        const albumWidth = 300;
        const contentWidth = window.innerWidth - 72; //60 for menuLeft, 12 for scrollbar (always visible on artistPage)
        const nrAlbums = Math.floor((contentWidth - 50) / albumWidth);
        const carouselWidth = albumWidth * nrAlbums

        return {
            carouselWidth: carouselWidth,
            nrAlbums: nrAlbums
        }
    }

    async #updateAlbumCarouselWidth() {
        const newDims = this.#calcAppropriateAlbumCarouselWidth();
        const oldCarouselWidth = this.#carouselWidth
        const newCarouselWidth = newDims.carouselWidth;
        if (oldCarouselWidth == newCarouselWidth) {
            return
        }
        const carousels = this.#carouselControls;
        this.#carouselWidth = newCarouselWidth
        const nrAlbumsNew = newDims.nrAlbums

        for (let i = 0; i < carousels.length; i++) {
            const carouselObject = carousels[i];
            const carousel = carouselObject.carousel;
            const carouselNavigatorContainer = carouselObject.carouselNavigatorContainer;
            const albums = carouselObject.albums;
            const title = carouselObject.title;
            carousel.style.width = `${newCarouselWidth}px`;

            this.#createAlbumNavigator(carouselNavigatorContainer, carousel, albums, nrAlbumsNew, title);
        }
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
        const artistBGImage = 
        data.visuals.headerImage?.sources[0].url || 
        data.visuals.avatarImage?.sources[0].url || 
        "standardImages/bgArtist.jpg";

        const backgroundImageContainer = document.createElement('div');
        backgroundImageContainer.setAttribute("id", "artist_background_image_container");

        const backgroundImage = document.createElement('img');
        backgroundImage.setAttribute("id", "artist_background_image");
        backgroundImage.src = artistBGImage;

        backgroundImageContainer.appendChild(backgroundImage);

        container.appendChild(backgroundImageContainer);
    }

    async #createHeaderContainer(container, data) {
        const artistName = data.profile.name
        const artistBGImage = 
            data.visuals.headerImage?.sources[0].url || 
            data.visuals.avatarImage?.sources[0].url || 
            "standardImages/bgArtist.jpg";

        const headerContainer = document.createElement('div');
        headerContainer.setAttribute("id", "artist_header_container");

        const headerImage = document.createElement('img');
        headerImage.setAttribute("id", "artist_header_image");
        this.#setCustomColors(headerImage, artistBGImage);

        const headerGradient = document.createElement('div');
        headerGradient.setAttribute("id", "artist_header_gradient");

        const headerTextContainer = document.createElement('div');
        headerTextContainer.setAttribute("id", "artist_header_text_container");

        const headerText = document.createElement('h1');
        headerText.setAttribute("id", "artist_header_text");
        headerText.innerHTML = artistName;

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
        const latestRelease = data.discography.latest

        const mostPopularContainer = document.createElement('div');
        mostPopularContainer.setAttribute("id", "artist_most_popular_container");

        const popularSongsContainer = document.createElement('div');

        if (latestRelease !== undefined) {
            const lastReleaseContainer = document.createElement('div');
            lastReleaseContainer.setAttribute("id", "artist_last_release_container");

            this.#createLatestRelease(lastReleaseContainer, latestRelease);

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
        const name = data.name
        const nrTracks = data.tracks.totalCount
        const songNumber = nrTracks == 1 ? "1 Song" : nrTracks + " Songs";
        const typeAlbum = data.type
        const date = data.date.year
        const imageURL = data.coverArt.sources[0]?.url || "standardImages/cover.jpg"

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
        latestReleaseImage.src = imageURL

        const latestReleaseTextContainer = document.createElement('div');
        latestReleaseTextContainer.setAttribute("id", "artist_latest_release_text_container");

        const latestReleaseTextName = document.createElement('h3');
        latestReleaseTextName.setAttribute("id", "artist_latest_release_text_name");
        latestReleaseTextName.innerHTML = name

        const latestReleaseTextNrSongs = document.createElement('p');
        latestReleaseTextNrSongs.setAttribute("id", "artist_latest_release_text_nr_songs");
        latestReleaseTextNrSongs.innerHTML = songNumber

        const latestReleaseTextDate = document.createElement('p');
        latestReleaseTextDate.setAttribute("id", "artist_latest_release_text_date");
        latestReleaseTextDate.innerHTML = date

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
        const topSongs = data.discography.topTracks?.items || []
        const maxLength = size == "small" ? 6 : 9;
        const realLength = topSongs.length > maxLength ? maxLength : topSongs.length;

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

        for (let i = 0; i < realLength; i++) {
            const topSongData = topSongs[i].track;
            const songId = topSongData.id;
            const songName = topSongData.name;
            const songArtists = getArtistsAsString(topSongData.artists.items);
            const songImageURL = getImageCoverUrl(topSongData);

            const songContainer = document.createElement('div');
            songContainer.setAttribute("class", "artist_grid_song_container");

            const songImageContainer = document.createElement('div');
            songImageContainer.setAttribute("class", "artist_grid_song_image_container");

            const songImage = document.createElement('img');
            songImage.setAttribute("class", "artist_grid_song_image");
            songImage.src = songImageURL

            const songTextContainer = document.createElement('div');
            songTextContainer.setAttribute("class", "artist_grid_song_text_container");

            const songTextName = document.createElement('h3');
            songTextName.setAttribute("class", "artist_grid_song_text_name");
            songTextName.innerHTML = songName

            const songTextArtists = document.createElement('p');
            songTextArtists.setAttribute("class", "artist_grid_song_text_artists");
            songTextArtists.innerHTML = songArtists

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
        const albums = data.discography.albums.items
        this.#createAlbumCarousel(container, albums, "Albums")

        const singles = data.discography.singles.items
        this.#createAlbumCarousel(container, singles, "Singles")
    }

    #createAlbumCarousel(container, albums, title) {
        const dims = this.#calcAppropriateAlbumCarouselWidth()
        const carouselWidth = dims.carouselWidth
        const nrAlbumsShown = dims.nrAlbums

        const albumsContainer = document.createElement('div');
        albumsContainer.setAttribute("class", "artist_albums_container");

        const albumsTitleContainer = document.createElement('div');
        albumsTitleContainer.setAttribute("class", "artist_albums_title_container");

        const albumsTitle = document.createElement('h2');
        albumsTitle.setAttribute("class", "artist_albums_title");
        albumsTitle.innerHTML = title

        const albumsCarousel = document.createElement('div');
        albumsCarousel.setAttribute("class", "artist_albums_carousel");
        albumsCarousel.style.width = `${carouselWidth}px`

        for (let i = 0; i < albums.length; i++) {
            const album = albums[i].releases.items[0];
            let name = album.name;
            const year = album.date.year;
            const imageURL = album.coverArt.sources[0].url;
            
            if (name.length > 15) {
                name = name.substring(0, 15) + "...";
            }

            const albumContainer = document.createElement('div');
            albumContainer.setAttribute("class", "artist_album_container");

            const albumInnerContainer = document.createElement('div');
            albumInnerContainer.setAttribute("class", "artist_album_inner_container");

            const albumImageContainer = document.createElement('div');
            albumImageContainer.setAttribute("class", "artist_album_image_container");

            const albumImage = document.createElement('img');
            albumImage.setAttribute("class", "artist_album_image");
            albumImage.src = imageURL

            const albumName = document.createElement('p');
            albumName.setAttribute("class", "artist_album_name");
            albumName.innerHTML = name

            const albumDate = document.createElement('p');
            albumDate.setAttribute("class", "artist_album_date");
            albumDate.innerHTML = year

            albumImageContainer.appendChild(albumImage);

            albumInnerContainer.appendChild(albumImageContainer);
            albumInnerContainer.appendChild(albumName);
            albumInnerContainer.appendChild(albumDate);

            albumContainer.appendChild(albumInnerContainer);

            albumsCarousel.appendChild(albumContainer);
        }

        const carouselNavigatorContainer = document.createElement('div');
        carouselNavigatorContainer.setAttribute("class", "artist_album_navigator_container");

        this.#createAlbumNavigator(carouselNavigatorContainer, albumsCarousel, albums, nrAlbumsShown, title)

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
        const widthSmallNavigatorIncrement = 80 / appropriateNrAlbumsCarousel;
        const nrBigNavigators = Math.floor(albums.length / appropriateNrAlbumsCarousel);
        const smallNavigatorIncrements = albums.length - (nrBigNavigators * appropriateNrAlbumsCarousel);
        const smallNavigatorWidth = widthSmallNavigatorIncrement * smallNavigatorIncrements;
        const smallNavigatorWidthHover = smallNavigatorWidth * 1.4;

        container.innerHTML = "";
    
        for (let i = 0; i < nrBigNavigators; i++) {
            const bigNavigator = document.createElement('div');
            bigNavigator.setAttribute("class", "artist_album_navigator");
    
            bigNavigator.addEventListener("click", function () {
                const scrollWidth = 300 * appropriateNrAlbumsCarousel * i;
                target.scrollTo({ left: scrollWidth, behavior: "smooth" });
            });
    
            container.appendChild(bigNavigator);
        }
    
        if (smallNavigatorIncrements > 0) {1
            const smallNavigator = document.createElement('div');
            smallNavigator.setAttribute("class", "artist_album_navigator");
            const id = "artist_smallNavigator" + title;
            smallNavigator.setAttribute("id", id);
            const css = 
                `
                #${id} {
                    width: ${smallNavigatorWidth}px;
                }
                
                #${id}:hover {
                    width: ${smallNavigatorWidthHover}px;
                }
            `
            const style = document.createElement('style');
            if (style.styleSheet) {
                style.styleSheet.cssText = css;
            } else {
                style.appendChild(document.createTextNode(css));
            }
            document.head.appendChild(style);
    
            smallNavigator.addEventListener("click", function () {
                target.scrollTo({ left: 100000, behavior: "smooth" });
            });

            container.appendChild(smallNavigator);
        }
    }

    #createBiography(container, data) {
        const bioText = data.profile.biography?.text || null;
        const images = data.visuals.gallery?.items || null;

        if (bioText == null && images == null) {
            return;
        }

        const biographyContainer = document.createElement('div');
        biographyContainer.setAttribute("class", "artist_biography_container");

        if (bioText != null) {
            this.#createBiographyText(biographyContainer, bioText);
        }

        container.appendChild(biographyContainer);
    }

    #createBiographyText(container, bioText) {
        const bioTextContainer = document.createElement('div');
        bioTextContainer.setAttribute("class", "artist_biography_text_container");
        const split1Array = bioText.split("<a");

        for (let i = 0; i < split1Array.length; i++) {
            const splitString = split1Array[i];
            const split2 = splitString.split("</a>");
            const linkPart = split2[0];
            const remainingText = split2[1];
            const button = this.#getReplacementTag(linkPart);

            if (i == 0) {
                const textContainer = document.createElement('span')
                textContainer.innerHTML = linkPart;
                bioTextContainer.appendChild(textContainer);
            } else {
                bioTextContainer.appendChild(button);
                const textContainer = document.createElement('span')
                textContainer.innerHTML = remainingText;
                bioTextContainer.appendChild(textContainer);
            }
        }
        container.appendChild(bioTextContainer);
    }

    #getReplacementTag(str) {
        const firstQuotationMark = str.indexOf('"') + 1;
        const secondQuotationMark = nth_ocurrence(str, '"', 2);
        const spotifyId = str
          .substring(firstQuotationMark, secondQuotationMark)
          .split(":")[2];
      
        const firstOcurrence = str.indexOf(">") + 1;
        const name = str.substring(firstOcurrence, str.length);  

        const button = document.createElement('div');
        button.setAttribute("class", "artist_biography_button");
        button.innerHTML = name
        button.addEventListener("click", function () {
            console.log(spotifyId)
        })

        return button;
      }

}

