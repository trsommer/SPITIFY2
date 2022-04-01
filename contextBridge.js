const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI',{
  searchSpotify: (input) => ipcRenderer.invoke('searchSpotify:input', input),
  getArtistInfo: (artistID) => ipcRenderer.invoke('get:artistInfo', artistID),
  getAlbumInfo: (albumID) => ipcRenderer.invoke('get:albumInfo', albumID),
  convertURL: (url) => ipcRenderer.invoke('convert:url', url),
  searchYoutube: (input) => ipcRenderer.invoke('searchYoutube:input', input)
})