const { app, BrowserWindow, ipcMain, Notification } = require("electron");
const path = require("path");
const dataBase = require("./dataBase");
const spotify = require("./spotify");
const youtube = require("./youtube");

function showNotification(title, body) {
  new Notification({ title: title, body: body }).show();
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1350,
    height: 850,
    minWidth: 1250,
    minHeight: 750,
    resizable: true,
    icon: path.join(__dirname, "spitifyIcon.icns"),
    titleBarStyle: "shown",
    webPreferences: {
      preload: path.join(__dirname, "contextBridge.js"),
    },
  });
  mainWindow.loadFile("interface/index.html");
  dataBase.createTables();
}

app.whenReady().then(() => {
  ipcMain.handle("searchSpotify:input", async (event, input) => {
    const response = await spotify.searchSpotify(input);
    return response;
  });
  ipcMain.handle("get:artistInfo", async (event, artistID) => {
    const response = await spotify.getArtistInfo(artistID);
    return response;
  });
  ipcMain.handle("get:albumInfo", async (event, albumID) => {
    const response = await spotify.getAlbumInfo(albumID);
    return response;
  });
  ipcMain.handle("convert:url", async (event, url) => {
    const response = await youtube.convertURL(url);
    return response;
  });
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
  ipcMain.handle("send:notification", async (event, title, body) => {
    showNotification(title, body);
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
  ipcMain.handle("update:streamingUrl", async (event, id, streamingUrl) => {
    dataBase.updateStreamingURL(id, streamingUrl);
  });
  ipcMain.handle("create:playlist", async (event, data) => {
    return dataBase.createPlaylist(data);
  });
  ipcMain.handle("like:song", async (event, spotifyId, type) => {
    dataBase.likeSong(spotifyId, type);
  });
  ipcMain.handle("get:playlistSongs", async (event, playlistName) => {
    return dataBase.getPlaylistSongs(playlistName);
  });
  ipcMain.handle("add:PlaylistSong", async (event, spotifyId, playlist) => {
    dataBase.addSongToPlaylist(spotifyId, playlist);
  })
  ipcMain.handle("remove:PlaylistSong", async (event, spotifyId, playlist) => {
    dataBase.removeSongFromPlaylist(spotifyId, playlist);
  })
  ipcMain.handle("change:PlaylistName", async (event, playlistId, name) => {
    dataBase.updatePlaylistName(playlistId, name);
  })
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
