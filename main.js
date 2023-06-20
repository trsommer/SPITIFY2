const { app, BrowserWindow, ipcMain, Notification, globalShortcut } = require("electron");
const Path = require("path");
const Fs = require('fs')  
const Axios = require("axios");
const dataBase = require("./dataBase");
const spotify = require("./spotify");
const youtube = require("./youtube");
const downloader = require("./downloader");
const song = require("./song");
let mainWindow;

async function showNotification(data) {
  imageUrl = data.imageUrl;
  console.log(imageUrl);

  await downloadImage(imageUrl)
  new Notification({ title: data.title, subtitle: data.subTitle, body: data.body, icon: "notificationImage.jpg" }).show();
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 850,
    minWidth: 1250,
    minHeight: 750,
    resizable: true,
    icon: Path.join(__dirname, "spitifyIcon.png"),
    titleBarStyle: "shown",
    autoHideMenuBar: true,
    webPreferences: {
      preload: Path.join(__dirname, "contextBridge.js"),
    },
  });
  mainWindow.loadFile("interface/index.html");
  dataBase.createTables();
}

app.whenReady().then(() => {
  ipcMain.handle("searchSpotify:input", async (event, input) => {
    spotify.searchSpotify(input, mainWindow);
  });
  ipcMain.handle("searchSpotifySpecificType:input", async (event, input, type, limit, offset) => {
    spotify.searchSpotifySpecificType(type, limit, offset, input, mainWindow);
  });
  ipcMain.handle("get:artistInfo", async (event, artistID) => {
    const response = await spotify.getArtistInfo(artistID);
    return response;
  });
  ipcMain.handle("get:songInfo", async (event, songIDs) => {
    const response = await spotify.addInfoArtistTracks(songIDs);
    return response;
  });
  ipcMain.handle("get:albumInfo", async (event, albumID) => {
    const response = await spotify.getAlbumInfo(albumID);
    return response;
  });
  ipcMain.handle("get:albumMetadata", async (event, albumID) => {
    const response = await spotify.getAlbumMetadata(albumID);
    return response;
  });
  ipcMain.handle("convert:url", async (event, url) => {
    const response = await youtube.convertURL(url);
    return response;
  });
  ipcMain.handle("generateSong:info", async (event, info) => {
    const response  = await song.generateSong(info);
    return response;
  })
  ipcMain.handle("searchYoutube:input", async (event, input) => {
    const response = await youtube.searchYoutubeMusic(input);
    return response;
  });
  ipcMain.handle(
    "getLevenshteinDistance:input", async (event, origin, comparison) => {
      const response = await youtube.getLevenshteinDistance(origin, comparison);
      return response;
    }
  );
  ipcMain.handle("send:notification", async (event, data) => {
    showNotification(data);
  });
  ipcMain.handle("insert:song", async (event, data) => {
    dataBase.insertSong(data);
  });
  ipcMain.handle("get:Database", async (event, query) => {
    const response = await dataBase.accessDatabase(query);
    return response;
  });
  ipcMain.handle("insert:lastSearch", async (event, data) => {
    dataBase.addLastSearch(data);
  });
  ipcMain.handle("delete:lastSearch", async (event) => {
    dataBase.deleteLastSearch();
  });
  ipcMain.handle("delete:specificLastSearch", async (event, id) => {
    dataBase.deleteSpecificLastSearch(id);
  });
  ipcMain.handle("update:song", async (event, data) => {
    dataBase.updateSong(data);
  });

  //Playlists

  ipcMain.handle("create:playlist", async (event, data) => {
    return dataBase.createPlaylist(data);
  });
  ipcMain.handle("like:song", async (event, spotifyId, type) => {
    dataBase.likeSong(spotifyId, type);
  });
  ipcMain.handle("get:playlistSongs", async (event, playlistName) => {
    return dataBase.getPlaylistSongs(playlistName);
  });
  ipcMain.handle("add:playlistSong", async (event, spotifyId, playlist) => {
    dataBase.addSongToPlaylist(spotifyId, playlist);
  })
  ipcMain.handle("remove:playlistSong", async (event, spotifyId, playlist) => {
    dataBase.removeSongFromPlaylist(spotifyId, playlist);
  })
  ipcMain.handle("change:playlistName", async (event, playlistId, name) => {
    dataBase.updatePlaylistName(playlistId, name);
  })
  ipcMain.handle("change:playlistImage", async (event, playlistId, url) => {
    dataBase.updatePlaylistImageCover(playlistId, url);
  })
  ipcMain.handle("update:playlist", async (event, playlistId, songData) => {
    dataBase.updatePlaylist(playlistId, songData);
  })

  //Downloaded Songs

  ipcMain.handle("download:songs", async (event, songs) => {
    return song.downloadSongs(songs, mainWindow);
  })
  ipcMain.handle("add:downloadedSong", async (event, songId) => {
    timestamp = new Date().getTime();
    dataBase.addDownloadedSong(songId, timestamp);
  })
  ipcMain.handle("remove:downloadedSong", async (event, songId) => {
    dataBase.removeDownloadedSong(songId);
  })
  ipcMain.handle("get:getDownloadedSongs", async (event) => {
    return dataBase.getDownloadedSongs();
  })

  //Followed Artists

  ipcMain.handle("get:followedArtists", async (event) => {
    return dataBase.getFollowedArtists();
  });
  ipcMain.handle("get:followStatus", async (event, artistId) => {
    return dataBase.getFollowStatus(artistId);
  });
  ipcMain.handle("follow:artist", async (event, artistId, latestReleaseId) => {
    dataBase.followArtist(artistId, latestReleaseId);
  });
  ipcMain.handle("unfollow:artist", async (event, artistId) => {
    dataBase.unfollowArtist(artistId);
  });
  
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  app.quit();
});

async function downloadImage(url) {  
  const filePath = Path.resolve(__dirname, 'notificationImage.jpg')
  const writer = Fs.createWriteStream(filePath)

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}
