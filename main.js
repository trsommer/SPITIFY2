const {app, BrowserWindow, ipcMain,dialog} = require('electron')
const path = require('path')
const axios = require('axios')
const { encode } = require('punycode')
const youtubedl = require('youtube-dl-exec')
const searchYT = require('youtube-search-without-api-key')

async function getAccessToken() {
  response = await axios.get("https://open.spotify.com/get_access_token")
  return response.data["accessToken"]
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

async function searchYoutube(input) {
  //start = new Date()
  searchResult = await searchYT.search(input)
  //time = new Date() - start
  //console.log('Execution time4: %dms', time)
  return searchResult
}

function getEncodedURL(url, variables, hash) {
  const params = new URLSearchParams()
  params.append('variables', variables)
  params.append('extensions', hash)
  return url + params.toString()
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
  ipcMain.handle('convert:url', async (event, url) => {
    const response = await convertURL(url)
    searchYoutube("bts")
    return response
  })
  ipcMain.handle('searchYoutube:input', async (event, input) => {
    const response = await searchYoutube(input)
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