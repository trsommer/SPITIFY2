const {app, BrowserWindow, ipcMain, Notification} = require('electron')
const path = require('path')
const axios = require('axios')
const { encode } = require('punycode')
const youtubedl = require('youtube-dl-exec')
const ytMusic = require('node-youtube-music')
const sqlite3 = require('sqlite3').verbose()

async function getAccessToken() {
  response = await axios.get("https://open.spotify.com/get_access_token")
  return response.data["accessToken"]
}

function showNotification(title, body) {
  new Notification({ title: title, body: body }).show()
}

async function searchSpotify(query) {
  //start = new Date()
  accessToken = await getAccessToken()
  urlStart = 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=searchDesktop&'
  variables = '{"searchTerm":"'+ query +'","offset":0,"limit":5,"numberOfTopResults":5}'
  hash = '{"persistedQuery":{"version":1,"sha256Hash":"75bbf6bfcfdf85b8fc828417bfad92b7cd66bf7f556d85670f4da8292373ebec"}}'

  url = getEncodedURL(urlStart, variables, hash)
  response = await axios.get(url, {headers: {'authorization': 'Bearer ' + accessToken}})
  //time = new Date() - start
  //console.log('Execution time1: %dms', time)
  return response.data
}

async function getArtistInfo(artistID) {
  //start = new Date()
  accessToken = await getAccessToken()
  testURL = 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryArtistOverview&'
  variables = '{"uri":"spotify:artist:' + artistID + '"}'
  hash = '{"persistedQuery": {"version": 1, "sha256Hash": "d66221ea13998b2f81883c5187d174c8646e4041d67f5b1e103bc262d447e3a0"}}'

  url = getEncodedURL(testURL, variables, hash)
  response = await axios.get(url, {headers: {'authorization': 'Bearer ' + accessToken}})
  //time = new Date() - start
  //console.log('Execution time2: %dms', time)
  return response.data
}

async function getAlbumInfo(albumID) {
  accessToken = await getAccessToken()
  urlStart = 'https://api-partner.spotify.com/pathfinder/v1/query?operationName=queryAlbumTracks&'
  variables = '{"uri":"spotify:album:' + albumID + '", "offset":0,"limit":300}'
  hash = '{"persistedQuery": {"version": 1, "sha256Hash": "3ea563e1d68f486d8df30f69de9dcedae74c77e684b889ba7408c589d30f7f2e"}}'

  url = getEncodedURL(urlStart, variables, hash)
  response = await axios.get(url, {headers: {'authorization': 'Bearer ' + accessToken}})
  return response.data
}

async function convertURL(url) {
  //start = new Date()
  output = await youtubedl(url, {
    getUrl: true,
    format: 'bestaudio/best'
  })
  //time = new Date() - start
  //console.log('Execution time3: %dms', time)
  return output
}

async function searchYoutubeMusic(input) {
  start = new Date()
  const music = await ytMusic.searchMusics(input)
  time = new Date() - start
  showNotification('Spitify now playing', input)
  console.log('Execution time4: %dms', time)
  return music
}

function getEncodedURL(url, variables, hash) {
  const params = new URLSearchParams()
  params.append('variables', variables)
  params.append('extensions', hash)
  return url + params.toString()
}

function accessDataBase(query) {
  db = getDB()
  db.all(query, (err, rows) => {
    if (err) {
      throw err
    }
    db.close()
    return rows
  })
}

function runOnDB(query) {
  db = getDB()
  db.run(query, (err) => {
    if (err) {
      throw err
    }
    db.close()
  })
}

function getDB() {
  db = new sqlite3.Database('./db/spitify.sqlite')
}

function testFunction() {
  runOnDB("CREATE TABLE songs (id INTEGER PRIMARY KEY, title TEXT, artist TEXT, album TEXT, youtubeID TEXT, duration INTEGER, imageUrl TEXT, streamingUrl TEXT)")
}

async function albumTest() {
  albumInfo = await getAlbumInfo("71O60S5gIJSIAhdnrDIh3N")
  console.log(albumInfo);
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 1350, 
    height: 850,
    'minWidth': 1250,
    'minHeight': 750, 
    resizable: true,
    icon: path.join(__dirname, 'spitifyIcon.icns'),
    titleBarStyle: 'shown',
    webPreferences: {
      preload: path.join(__dirname, 'contextBridge.js')
    }
  })
  mainWindow.loadFile('interface/index.html')
  getDB()
  albumTest()
  //testFunction()
}

app.whenReady().then(() => {
  ipcMain.handle('searchSpotify:input', async (event, input) => {
    const response = await searchSpotify(input)
    return response
  })
  ipcMain.handle('get:artistInfo', async (event, artistID) => {
    const response = await getArtistInfo(artistID)
    return response
  })
  ipcMain.handle('get:albumInfo', async (event, albumID) => {
    const response = await getAlbumInfo(albumID)
    return response
  })
  ipcMain.handle('convert:url', async (event, url) => {
    const response = await convertURL(url)
    return response
  })
  ipcMain.handle('searchYoutube:input', async (event, input) => {
    const response = await searchYoutubeMusic(input)
    return response
  })
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})