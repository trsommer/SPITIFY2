const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  searchSpotify: (input) => ipcRenderer.invoke('searchSpotify:input', input),
  getArtistInfo: (artistID) => ipcRenderer.invoke('get:artistInfo', artistID),
  getAlbumInfo: (albumID) => ipcRenderer.invoke('get:albumInfo', albumID),
  convertURL: (url) => ipcRenderer.invoke('convert:url', url),
  searchYoutube: (input) => ipcRenderer.invoke('searchYoutube:input', input),
  sendNotification: (title, body) => ipcRenderer.invoke('send:notification', title, body),
  insertSong: (data) => ipcRenderer.invoke('insert:song', data),
  getFromDB: (query) => ipcRenderer.invoke('get:Database', query),
  updateStreamingUrl: (id, url) => ipcRenderer.invoke('update:streamingUrl', id, url),
  getLevenshteinDistance: (origin, comparison) => ipcRenderer.invoke('getLevenshteinDistance:input', origin, comparison),
  insertLastSearch: (data) => ipcRenderer.invoke('insert:lastSearch', data),
  deleteLastSearch: () => ipcRenderer.invoke('delete:lastSearch'),
  deleteSpecificLastSearch: (id) => ipcRenderer.invoke('delete:specificLastSearch', id),
  createPlaylist: (data) => ipcRenderer.invoke('create:playlist', data),
  likeSong: (spotifyId, type) => ipcRenderer.invoke('like:song', spotifyId, type),
  getPlaylistSongs: (playlistName) => ipcRenderer.invoke('get:playlistSongs', playlistName),
  addSongToPlaylist: (spotifyId, playlist) => ipcRenderer.invoke('add:playlistSong', spotifyId, playlist),
  removeSongFromPlaylist: (spotifyId, playlist) => ipcRenderer.invoke('remove:playlistSong', spotifyId, playlist),
  changePlaylistName: (playlistId, name) => ipcRenderer.invoke('change:playlistName', playlistId, name),
  changeImageCover: (playlistId, url) => ipcRenderer.invoke('change:playlistImage', playlistId, url)
})