var playlists = []

function playlists_view() {
    updatePlaylists();
}


async function updatePlaylists() {
    await getPlaylistsFromDB();
    console.log(playlists);
    setContent(playlists);
}

async function getPlaylistsFromDB() {
    playlists = await getFromDB("SELECT * FROM playlists")

}

async function createPlaylist() {
    let playlists = getPlaylists();

    data = {
        name: "Your Playlist " + (playlists.length + 1),
        remote: 0,
        spotifyId: "",
        imageUrl: "standardImages/cover.jpg",
    }

    id = await createPlaylistDB(data)
    console.log(id);
    updatePlaylists();
}

async function openPlaylist(playlistId) {
    console.log(playlistId);
    playlistName = 'playlist' + playlistId;
    if(playlistId == 'Likes') {
        data = {
            id: "Likes",
            imageUrl: "standardImages/cover.jpg",
            name: "Your Favourite Songs",
            remote: 0,
            spotifyId: ""
        }
    } else {
        data = playlists[playlistId - 1];
    }
    result = await getPlaylistSongs(playlistName);
    switchView("playlist_view");
    setContentPlaylist(data, result);
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
        const imageUrl = content[index].imageUrl;
        if (name == "") {
            name = "Playlist " + id;
        }

        var playlistItem = document.createElement("div");
        playlistItem.classList.add("playlists_item");

        var playlistImage = document.createElement("img");
        playlistImage.classList.add("playlist_item_image");
        playlistImage.src = imageUrl;

        var playlistTextContainer = document.createElement("div");
        playlistTextContainer.classList.add("playlists_item_text_container");

        var playlistTitle = document.createElement("p");
        playlistTitle.classList.add("playlists_item_text");
        playlistTitle.innerHTML = name;

        playlistTextContainer.appendChild(playlistTitle);

        playlistItem.appendChild(playlistImage);
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