var contextMenuShown = false;
var contextSubMenuShown = false;
var clickedSongInfo = [];
var clickedPlaylistSongInfo = [];
var clickedArtistTopSong = [];
var clickedAlbumSongInfo = [];
var playlistId = 0;

window.addEventListener("click", (e) => {
  //closes context menu on click outside of menu
  if (contextMenuShown) {
    contextMenuShown = false;
    console.log("clicked");
    document.getElementById("context_menu_container").innerHTML = "";
    contextSubMenuShown = false;
    enableScroll();
  }
});


document.addEventListener('keyup', (e) => {
  //closes context menu on esc
    if (e.key == "Escape" && contextMenuShown) {
      contextMenuShown = false;
      document.getElementById("context_menu_container").innerHTML = "";
      contextSubMenuShown = false;
      removeSubMenu();
      enableScroll();
    }
});

function setClickedSong(info) {
  clickedSongInfo = info;
}

function setClickedPlaylistSong(info, id) {
    clickedPlaylistSongInfo = info;
    playlistId = id;
}

function setClickedArtistTopSong(info) {
  clickedArtistTopSong = info;
}

function setClickedAlbumSong(info) {
  clickedAlbumSongInfo = info;
}

function spawnContextMenu(cursorX, cursorY, content) {
  //spawns the context menu on given position with given content
  document.getElementById("context_menu_container").innerHTML = "";
  disableScroll();
  var menu = document.createElement("div");
  menu.classList.add("context_menu");
  menu.id = "context_main_menu";
  menu.style.display = "block";
  var menuWidth = 150;
  var windowWidth = window.innerWidth;
  var menuHeight = 10 + 32 * content.length; //10 for top and bottom padding, 32 for each button
  var windowHeight = window.innerHeight;

  var offsetLeft;
  var offsetTop;

  if (menuWidth + cursorX + 50 > windowWidth) {
    offsetLeft = cursorX - menuWidth;
  } else {
    offsetLeft = cursorX;
  }

  if (menuHeight + cursorY + 50 > windowHeight) {
    //on top of cursor
    offsetTop = cursorY - menuHeight;
  } else {
    //below cursor
    offsetTop = cursorY;
    console.log(cursorY, menuHeight);
  }

  const scrollAmount = window.scrollY;
  console.log(scrollAmount);

  offsetTop = offsetTop + scrollAmount;

  menu.style.left = offsetLeft + "px";
  menu.style.top = offsetTop + "px";

  for (let index = 0; index < content.length; index++) {
    let buttonContent = content[index];
    var subMenuButton = document.createElement("div");
    subMenuButton.classList.add("context_menu_button");
    subMenuButton.innerHTML = buttonContent.name;

    if (buttonContent.subMenu != null) {
      console.log("submenu");
      subMenuButton.addEventListener("mouseover", (e) => {
        removeSubMenu();
        console.log("mouseover");
        buttonContent.subMenu(offsetLeft, offsetTop, index, "right");
      });

    } else {
      subMenuButton.addEventListener("mouseenter", (e) => {
        removeSubMenu();
      });
    }

    if (buttonContent.action != null) {
      subMenuButton.addEventListener("click", (e) => {
        buttonContent.action();
      });
    }

    menu.appendChild(subMenuButton);
  }

  document.getElementById("context_menu_container").appendChild(menu);
  contextMenuShown = true;
}

function spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content) {
  //spawns the context menu relative to the button that spawned it
  removeSubMenu();
  var subMenu = document.createElement("div");
  subMenu.classList.add("context_menu");
  subMenu.id = "context_sub_menu";

  subMenu.style.display = "block";

  var calculatedOffsetTop = OffsetTop + 5 + 16 + 32 * buttonIndex; //5 for top padding, 16 for middle of button, 32 for each button

  var menuWidth = 150;
  var subMenuWidth = 160;
  var windowWidth = window.innerWidth;
  var calculatedOffsetLeft = 0;
  var menuHeight = 10 + 32 * content.length; //10 for top and bottom padding, 32 for each button
  var bottomPossible = true;

  totalHeight = calculatedOffsetTop + menuHeight;
  totalWindowHeight = window.innerHeight + window.scrollY;


  if (totalHeight > totalWindowHeight) {
    bottomPossible = false;
    calculatedOffsetTop = OffsetTop + 5 + 16 + 32 * buttonIndex - menuHeight;
  }

  if (offsetLeft + menuWidth + 2 + menuWidth + 50 > windowWidth) {
    console.log("right");
    calculatedOffsetLeft = offsetLeft - subMenuWidth - 2 - 10;
    if (bottomPossible) {
      subMenu.style.borderRadius = "20px 0 20px 20px";
    } else {
      subMenu.style.borderRadius = "20px 20px 0 20px";
    }
  } else {
    console.log("left");
    calculatedOffsetLeft = offsetLeft + menuWidth + 2 + 10;

    if (bottomPossible) {
    subMenu.style.borderRadius = "0 20px 20px 20px";
    } else {
      subMenu.style.borderRadius = "20px 20px 20px 0";
    }
  }

  subMenu.style.left = calculatedOffsetLeft + "px";
  subMenu.style.top = calculatedOffsetTop + "px";

  for (let i = 0; i < content.length; i++) {
    var subMenuButton = document.createElement("div");
    subMenuButton.classList.add("context_menu_button");
    subMenuButton.innerHTML = content[i].name;

    if (content[i].action != null) {
      subMenuButton.addEventListener("click", (e) => {
        content[i].action(i);
      });
    }

    subMenu.appendChild(subMenuButton);
  }

  contextSubMenuShown = true;

  subMenu.addEventListener("mouseleave", (e) => {
    removeSubMenu();
  });

  document.getElementById("context_menu_container").appendChild(subMenu);
}

function removeSubMenu() {
  //removes the submenu
  var childCount = document.getElementById(
    "context_menu_container"
  ).childElementCount;

  if (childCount > 1) {
    document
      .getElementById("context_menu_container")
      .removeChild(document.getElementById("context_menu_container").lastChild);
    contextSubMenuShown = false;
  }
}

function disableScroll() {
  // Get the current page scroll position
  scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,

      // if any scroll is attempted, set this to the previous value
      window.onscroll = function() {
          window.scrollTo(scrollLeft, scrollTop);
      };
}

function enableScroll() {
  window.onscroll = function() {};
}

//search song menu

async function spawnSongMenu(e) {
  getPlaylistsFromDB();
  let cursorX = e.clientX;
  let cursorY = e.clientY;
  let content = [
    { name: "play", action: contextPlay, subMenu: null },
    { name: "play next", action: contextPlayNext, subMenu: null },
    { name: "play after queue", action: contextPlayAfterQueue, subMenu: null },
    { name: "add to playlist", action: null, subMenu: contextPlaylists },
    { name: "open Artist", action: contextOpenSingleArtist, subMenu: contextArtists },
    { name: "download", action: contextDownload, subMenu: null },
  ];

  spawnContextMenu(cursorX, cursorY, content);
}

function contextPlaylists(offsetLeft, OffsetTop, buttonIndex, side) {
    let playlists = getPlaylists();
    let content = [];
  
    for (let i = 0; i < playlists.length; i++) {
      let playlist = playlists[i];
      let newPlaylistContent = {
        name: playlist.name,
        action: contextAddToPlaylist,
        subMenu: null,
      };
  
      content.push(newPlaylistContent);
    }
  
    content.push({
      name: "new playlist",
      action: contextAddToNewPlaylist,
      subMenu: null,
    });
  
    console.log(content);
  
    spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextArtists(offsetLeft, OffsetTop, buttonIndex, side) {
    const artists = clickedSongInfo.artists.items;

    if (artists.length == 1) {
        return;
    }

    content = [];

    for (let i = 0; i < artists.length; i++) {
        let artist = artists[i];
        let newArtistContent = {
            name: artist.profile.name,
            action: contextOpenArtist,
            subMenu: null,
        };

        content.push(newArtistContent);
    }

    spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextPlay() {
  playSongNow(clickedSongInfo);
}

async function contextPlayNext() {
  const song = await new Song(clickedSongInfo);
  skipQueue(song);
}

async function contextPlayAfterQueue() {
  const song = await new Song(clickedSongInfo);
  addToQueue(song);
}

async function contextDownload() {
  const song = await new Song(clickedSongInfo, "download");
}



async function contextAddToPlaylist(index) {
  let song = await new Song(clickedSongInfo);
  addPlaylistSong(clickedSongInfo.id, index + 1);
}

async function contextAddToNewPlaylist() {
  new Song(clickedSongInfo);
  const playlistId = await createPlaylist();
  addPlaylistSong(clickedSongInfo.id, playlistId);
  
}

function contextOpenSingleArtist() {
    artists = clickedSongInfo.artists.items;

    if (artists.length != 1) {
        return; 
    }

    let artist = artists[0];
    artistURI = artist.uri;
    artistId = artistURI.split(":")[2];
    openArtist(artistId);
}

function contextOpenArtist(i) {
    artists = clickedSongInfo.artists.items;
    artistURI = artists[i].uri;
    artistId = artistURI.split(":")[2];

    console.log(artistId);

    openArtist(artistId);
}

//playlist context menu

async function spawnPlaylistMenu(e, songInfo) {
  let cursorX = e.clientX;
  let cursorY = e.clientY;
  console.log(songInfo);
  let content = [
    { name: "play", action: contextPlaylistPlay, subMenu: null },
    { name: "play next", action: contextPlaylistPlayNext, subMenu: null },
    { name: "play after queue", action: contextPlaylistPlayAfterQueue, subMenu: null },
    { name: "add to playlist", action: null, subMenu: contextPlaylistsAddToPlaylists },
    { name: "open Artist", action: contextPlaylistOpenSingleArtist, subMenu: contextPlaylistArtists },
    { name: "delete", action: contextPlaylistDelete, subMenu: null },
    { name: "download", action: contextPlaylistDownload, subMenu: null },
  ];

  spawnContextMenu(cursorX, cursorY, content);
}

function contextPlaylistsAddToPlaylists(offsetLeft, OffsetTop, buttonIndex, side) {
  let playlists = getPlaylists();
  let content = [];

  for (let i = 0; i < playlists.length; i++) {
    let playlist = playlists[i];
    let newPlaylistContent = {
      name: playlist.name,
      action: contextPlaylistAddToPlaylist,
      subMenu: null,
    };

    content.push(newPlaylistContent);
  }

  content.push({
    name: "new playlist",
    action: contextPlaylistAddToNewPlaylist,
    subMenu: null,
  });

  console.log(content);

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

async function contextPlaylistAddToPlaylist(index) {
  new Song(clickedPlaylistSongInfo);
  addPlaylistSong(clickedPlaylistSongInfo.id, index + 1);
}

async function contextPlaylistAddToNewPlaylist() {
  new Song(clickedPlaylistSongInfo);
  const playlistId = await createPlaylist();
  addPlaylistSong(clickedPlaylistSongInfo.id, playlistId);
  
}

function contextPlaylistArtists(offsetLeft, OffsetTop, buttonIndex, side) {
  const artists = JSON.parse(JSON.parse(clickedPlaylistSongInfo.info).songArtistArray).items;

  console.log(artists);

  if (artists.length == 1) {
      return;
  }

  content = [];

  for (let i = 0; i < artists.length; i++) {
      let artist = artists[i];
      let newArtistContent = {
          name: artist.profile.name,
          action: contextPlaylistOpenArtist,
          subMenu: null,
      };

      content.push(newArtistContent);
  }

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextPlaylistPlay() {
  playSongNow(clickedPlaylistSongInfo);
}

async function contextPlaylistPlayNext() {
    const song = await new Song(clickedPlaylistSongInfo);
    skipQueue(song);
}

async function contextPlaylistPlayAfterQueue() {
    const song = await new Song(clickedPlaylistSongInfo);
    addToQueue(song);
}

function contextPlaylistOpenSingleArtist() {
    const artists = JSON.parse(JSON.parse(clickedPlaylistSongInfo.info).songArtistArray).items;

    if (artists.length != 1) {
        return; 
    }

    const artist = artists[0];
    const artistURI = artist.uri;
    const artistId = artistURI.split(":")[2];
    openArtist(artistId);
}

function contextPlaylistOpenArtist(index) {
    const artists = JSON.parse(JSON.parse(clickedPlaylistSongInfo.info).songArtistArray).items;

    const artistURI = artists[index].uri;
    const artistId = artistURI.split(":")[2];

    openArtist(artistId);
}

function contextPlaylistDelete() {
    songID = clickedPlaylistSongInfo.id;
    removeSongFromThisPlaylist(songID, playlistId);
}

async function contextPlaylistDownload() {
  const song = await new Song(clickedPlaylistSongInfo, "download");
}

//artist context menu

async function spawnArtistMenu(e, songInfo) {
  let cursorX = e.clientX;
  let cursorY = e.clientY;
  console.log(songInfo);
  let content = [
    { name: "play", action: contextArtistPlay, subMenu: null },
    { name: "play next", action: contextArtistPlayNext, subMenu: null },
    { name: "play after queue", action: contextArtistPlayAfterQueue, subMenu: null },
    { name: "add to playlist", action: null, subMenu: contextArtistPlaylists },
    { name: "open Artist", action: contextArtistOpenSingleArtist, subMenu: contextArtistOpenArtists },
    { name: "download", action: contextArtistDownload, subMenu: null },
  ];

  spawnContextMenu(cursorX, cursorY, content);
}

function contextArtistPlaylists(offsetLeft, OffsetTop, buttonIndex, side) {
  let playlists = getPlaylists();
  let content = [];

  for (let i = 0; i < playlists.length; i++) {
    let playlist = playlists[i];
    let newPlaylistContent = {
      name: playlist.name,
      action: contextArtistAddToPlaylist,
      subMenu: null,
    };

    content.push(newPlaylistContent);
  }

  content.push({
    name: "new playlist",
    action: contextArtistAddToNewPlaylist,
    subMenu: null,
  });

  console.log(content);

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

async function contextArtistAddToPlaylist(index) {
  new Song(clickedArtistTopSong);
  addPlaylistSong(clickedArtistTopSong.id, index + 1);
}

async function contextArtistAddToNewPlaylist() {
  new Song(clickedArtistTopSong);
  const playlistId = await createPlaylist();
  addPlaylistSong(clickedArtistTopSong.id, playlistId);
  
}

function contextArtistOpenArtists(offsetLeft, OffsetTop, buttonIndex, side) {
  const artists = clickedArtistTopSong.artists.items;

  if (artists.length == 1) {
      return;
  }

  content = [];

  for (let i = 0; i < artists.length; i++) {
      let artist = artists[i];
      let newArtistContent = {
          name: artist.profile.name,
          action: contextArtistOpenArtist,
          subMenu: null,
      };

      content.push(newArtistContent);
  }

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextArtistOpenSingleArtist() {
  const artists = clickedArtistTopSong.artists.items;

  if (artists.length != 1) {
      return; 
  }

  const artist = artists[0];
  const artistURI = artist.uri;
  const artistId = artistURI.split(":")[2];
  openArtist(artistId);
}

function contextArtistOpenArtist(i) {
      artists = clickedArtistTopSong.artists.items;
    artistURI = artists[i].uri;
    artistId = artistURI.split(":")[2];

    console.log(artistId);

    openArtist(artistId);
}

function contextArtistPlay() {
  playSongNow(clickedArtistTopSong);
}

async function contextArtistPlayNext() {
      const song = await new Song(clickedArtistTopSong);
    skipQueue(song);
}

async function contextArtistPlayAfterQueue() {
  const song = await new Song(clickedArtistTopSong);
  addToQueue(song);
}

async function contextArtistDownload() {
  const song = await new Song(clickedArtistTopSong, "download");
}

//album context menu

async function spawnAlbumMenu(e, songInfo) {
  let cursorX = e.clientX;
  let cursorY = e.clientY;
  console.log(songInfo);
  let content = [
    { name: "play", action: contextAlbumPlay, subMenu: null },
    { name: "play next", action: contextAlbumPlayNext, subMenu: null },
    { name: "play after queue", action: contextAlbumPlayAfterQueue, subMenu: null },
    { name: "add to playlist", action: null, subMenu: contextAlbumPlaylists },
    { name: "open Artist", action: contextAlbumOpenSingleArtist, subMenu: contextAlbumOpenArtists },
    { name: "download", action: contextAlbumDownload, subMenu: null },
  ];

  spawnContextMenu(cursorX, cursorY, content);
}

function contextAlbumPlaylists(offsetLeft, OffsetTop, buttonIndex, side) {
  let playlists = getPlaylists();
  let content = [];

  for (let i = 0; i < playlists.length; i++) {
    let playlist = playlists[i];
    let newPlaylistContent = {
      name: playlist.name,
      action: contextAlbumAddToPlaylist,
      subMenu: null,
    };

    content.push(newPlaylistContent);
  }

  content.push({
    name: "new playlist",
    action: contextAlbumAddToNewPlaylist,
    subMenu: null,
  });

  console.log(content);

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextAlbumAddToPlaylist(index) {
  new Song(clickedAlbumSongInfo);
  addPlaylistSong(clickedAlbumSongInfo.id, index + 1);
}

async function contextAlbumAddToNewPlaylist() {
  new Song(clickedAlbumSongInfo);
  const playlistId = await createPlaylist();
  addPlaylistSong(clickedAlbumSongInfo.id, playlistId);
}

function contextAlbumOpenArtists(offsetLeft, OffsetTop, buttonIndex, side) {
  const artists = clickedAlbumSongInfo.artists.items;

  if (artists.length == 1) {
      return;
  }

  content = [];

  for (let i = 0; i < artists.length; i++) {
      let artist = artists[i];
      let newArtistContent = {
          name: artist.profile.name,
          action: contextAlbumOpenArtist,
          subMenu: null,
      };

      content.push(newArtistContent);
  }

  spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content);
}

function contextAlbumOpenSingleArtist() {
  const artists = clickedAlbumSongInfo.artists.items;

  if (artists.length != 1) {
      return;
  }

  const artist = artists[0];
  const artistURI = artist.uri;
  const artistId = artistURI.split(":")[2];
  openArtist(artistId);
}

function contextAlbumOpenArtist(i) {
  const artists = clickedAlbumSongInfo.artists.items;
  const artistURI = artists[i].uri;
  const artistId = artistURI.split(":")[2];
  openArtist(artistId);
}

async function contextAlbumPlay() {
  playSongNow(clickedAlbumSongInfo);
}

async function contextAlbumPlayNext() {
  const song = await new Song(clickedAlbumSongInfo);
  skipQueue(song);
}

async function contextAlbumPlayAfterQueue() {
  const song = await new Song(clickedAlbumSongInfo);
  addToQueue(song);
}

async function contextAlbumDownload() {
  const song = await new Song(clickedAlbumSongInfo, "download");
}