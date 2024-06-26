var playlists = []

function playlists_view() {
    updatePlaylists();
    stopMenuLogoColorChange(false);
    updateTopBarVisible(true);
}


async function updatePlaylists() {
    await getPlaylistsFromDB();
    console.log(playlists);
    setContent(playlists);
}

async function getPlaylistsFromDB() {
    playlists = await getFromDB("SELECT * FROM playlists")
}

async function getSpecificPlaylistFromDB(playlistId) {
    playlistName = 'playlist' + playlistId;
    playlist = await getFromDB("SELECT * FROM " + playlistName)
    return playlist;
}


async function createPlaylist() {
    let playlists = getPlaylists();

    data = {
        name: "Your Playlist " + (playlists.length + 1),
        remote: 0,
        locked: 0,
        spotifyId: "",
        imageUrl: "standardImages/cover.jpg",
        author: "You"
    }

    id = await createPlaylistDB(data)
    console.log(id);
    updatePlaylists();

    return id;
}

async function createSpecificPlaylist(name, author, imageUrl, locked) {
    data = {
        name: name,
        remote: 0,
        locked: locked,
        spotifyId: "",
        imageUrl: imageUrl,
        author: author
    }

    id = await createPlaylistDB(data)
    console.log(id);
    updatePlaylists();

    return id;
}

async function openPlaylist(playlistId) {
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
        data = playlists[playlistId - 1];
    }
    result = await getPlaylistSongs(playlistId);
    console.log(result);
    switchView("playlist_view");
    await setContentPlaylist(data, result, playlistId);
}

function setContent(content) {
    createPlaylistsButton = document.getElementById("playlists_addPlaylist");
    likedPlaylistsButton = document.getElementById("playlists_liked_songs");
    playlistsContainer = document.getElementById("playlists_items_container")
    playlistsContainer.removeChild(likedPlaylistsButton);
    playlistsContainer.removeChild(createPlaylistsButton);
    playlistsContainer.innerHTML = "";
    playlistsContainer.appendChild(likedPlaylistsButton);

    for (let index = 0; index < content.length; index++) {
        let name = content[index].name;
        const id = content[index].id;
        const imageUrlString = content[index].imageUrl;
        const imageUrls = imageUrlString.split(",");
        const imageUrl = imageUrls[0];

        
        if (name == "") {
            name = "Playlist " + id;
        }

        var playlistItem = document.createElement("div");
        playlistItem.classList.add("playlists_item");

        var playlistTextContainer = document.createElement("div");
        playlistTextContainer.classList.add("playlists_item_text_container");

        var playlistTitle = document.createElement("p");
        playlistTitle.classList.add("playlists_item_text");
        playlistTitle.innerHTML = name;

        playlistTextContainer.appendChild(playlistTitle);

        if (imageUrls.length == 1) {
            //singe image
            var playlistImage = document.createElement("img");
            playlistImage.classList.add("playlist_item_image");
            playlistImage.src = imageUrl;
            playlistItem.appendChild(playlistImage);
        } else {
            //quad image

            var playlistImageContainer = document.createElement("div");
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
            openPlaylist(id);
        });

        playlistsContainer.appendChild(playlistItem);
    }

    playlistsContainer.appendChild(createPlaylistsButton);
} 

function getPlaylists() {
    return playlists;
}