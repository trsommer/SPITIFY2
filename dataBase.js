const DataBase = require("better-sqlite3")
const { app } = require("electron")
var fs = require("fs")
const path = require("path")

module.exports = {
  accessDatabase,
  getDB,
  createTables,
  insertSong,
  updateSong,
  addLastSearch,
  deleteLastSearch,
  deleteSpecificLastSearch,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  likeSong,
  getPlaylistSongs,
  updatePlaylistName,
  updatePlaylistImageCover,
  updatePlaylist,
  addDownloadedSong,
  removeDownloadedSong,
  getDownloadedSongs,
  getFollowedArtists,
  getFollowStatus,
  followArtist,
  unfollowArtist,
  getSong,
  getSongLikeStatus
}

async function accessDatabase(query) {
  db = await getDB()
  result = await db.prepare(query).all()
  return result
}

async function getDB() {
  documentsPath = app.getPath("documents")
  folderPath = path.join(documentsPath, "Spitify")

  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
  dbPath = path.join(folderPath, "spitifyDB.sqlite")
  db = new DataBase(dbPath)
  return db
}
async function createTables() {
  documentsPath = app.getPath("documents")
  dbPath = path.join(documentsPath, "Spitify", "spitifyDB.sqlite")

  var sql = "CREATE TABLE songs (id TEXT PRIMARY KEY, info TEXT)"
  var sql2 =
    "CREATE TABLE lastSearches (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, type TEXT, name TEXT, spotifyId TEXT, imageUrl TEXT, additionalInfo TEXT)"

  var sql3 =
    "CREATE TABLE playlists (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, remote INTEGER, locked INTEGER, spotifyId TEXT, imageUrl TEXT, author TEXT)"

  var sql4 = "CREATE TABLE playlistLikes (id TEXT PRIMARY KEY)"

  var sql5 = "CREATE TABLE downloadedSongs (id TEXT PRIMARY KEY, timestamp TEXT)"

  var sql6 = "CREATE TABLE followedArtists (id TEXT PRIMARY KEY, idLatestRelease TEXT)"

  if (!fs.existsSync(dbPath)) {
    db = await getDB()
    db.prepare(sql).run()
    db.prepare(sql2).run()
    db.prepare(sql3).run()
    db.prepare(sql4).run()
    db.prepare(sql5).run()
    db.prepare(sql6).run()
    return
  }
  db = await getDB()
}

async function insertSong(data) {
  console.log(data)
  db = await getDB()
  const insert = db.prepare(`INSERT INTO songs (id, info) VALUES (?, ?)`)
  insert.run(data.id, JSON.stringify(data.songData))
}

async function addLastSearch(data) {
  currentTimeStamp = new Date().getTime()
  db = await getDB()

  const insert = db.prepare(`INSERT INTO lastSearches (type, timestamp, name, spotifyId, imageUrl, additionalInfo) VALUES (?, ?, ?, ?, ?, ?)`)
  insert.run(data.type, currentTimeStamp, data.name, data.spotifyId, data.imageUrl, data.additionalInfo)
}

async function deleteLastSearch() {
  db = await getDB()
  db.prepare(`DELETE FROM lastSearches ORDER BY id LIMIT 1;`).run()
}

async function deleteSpecificLastSearch(id) {
  db = await getDB()
  sql = `DELETE FROM lastSearches WHERE spotifyid = ?`
  db.prepare(sql).run(id)
}

async function updateSong(data) {
  db = await getDB()
  console.log(data)
  db.prepare(`UPDATE songs SET info = ? WHERE id = ?`).run(JSON.stringify(data.songData), data.id)
}

async function createPlaylist(data) {
  db = await getDB()
  const insert = db.prepare(`INSERT INTO playlists (name, remote, locked, spotifyId, imageUrl, author) VALUES (?, ?, ?, ?, ?, ?)`)

  insert.run(data.name, data.remote, data.locked, data.spotifyId, data.imageUrl, data.author)

  result = await accessDatabase(`SELECT MAX(id) FROM playlists`)

  var id = result[0]["MAX(id)"]

  sql = "CREATE TABLE playlist" + id + " (id TEXT PRIMARY KEY)"

  db.prepare(sql).run()

  return id
}

async function addSongToPlaylist(spotifyId, playlistId) {
  db = await getDB()
  db.prepare(`INSERT INTO playlist${playlistId} (id) VALUES (?)`).run(spotifyId)
}

async function removeSongFromPlaylist(spotifyId, playlistId) {
  db = await getDB()
  db.prepare(`DELETE FROM playlist${playlistId} WHERE id = ?`).run(spotifyId)
}

async function likeSong(spotifyId, type) {
  console.log(spotifyId, type)
  db = await getDB()
  switch (type) {
    case 0:
      sql = `INSERT INTO playlistLikes (id) VALUES (?)`
      db.prepare(sql).run(spotifyId)
      break
    case 1:
      sql = `DELETE FROM playlistLikes WHERE id = ?`
      db.prepare(sql).run(spotifyId)
      break
  }
}

async function getPlaylistSongs(playlistName) {
  let result = await accessDatabase(`SELECT * FROM ${playlistName}`)
  let results = []
  db = await getDB()

  for (let index = 0; index < result.length; index++) {
    const id = result[index].id
    let song = await db.prepare(`SELECT * FROM songs WHERE id='${id}'`).all()
    results.push(song[0])
  }
  return results
}

async function updatePlaylistName(playlistId, name) {
  console.log(playlistId, name)

  db = await getDB()
  db.prepare(`UPDATE playlists SET name = ? WHERE id = ?`).run(name, playlistId)
}

async function updatePlaylistImageCover(playlistId, imageCoverUrl) {
  console.log(playlistId, imageCoverUrl)

  db = await getDB()
  db.prepare(`UPDATE playlists SET imageUrl = ? WHERE id = ?`).run(imageCoverUrl, playlistId)
}

async function updatePlaylist(playlistId, songData) {
  db = await getDB()
  //removes all songs from playlist
  const sql = `DELETE FROM playlist${playlistId}`
  console.log(sql)
  db.prepare(sql).run()

  for (let i = 0; i < songData.length; i++) {
    const song = songData[i]
    addSongToPlaylist(song, playlistId)
  }
}

async function addDownloadedSong(spotifyId, timestamp) {
  db = await getDB()
  db.prepare(`INSERT INTO downloadedSongs (id, timestamp) VALUES (?, ?)`).run(spotifyId, timestamp)
}

async function removeDownloadedSong(spotifyId) {
  db = await getDB()
  db.prepare(`DELETE * FROM downloadedSongs WHERE id = ?`).run(spotifyId)
}

async function getDownloadedSongs() {
  result = await accessDatabase(`SELECT * FROM downloadedSongs`)
  let results = []
  for (let index = 0; index < result.length; index++) {
    const id = result[index].id
    let song = await db.prepare(`SELECT * FROM songs WHERE id='${id}'`).all()
    results.push(song[0])
  }
  return results
}

//returns all followed artists with their latest release (as id)
async function getFollowedArtists() {
  db = await getDB()
  let result = await db.prepare(`SELECT * FROM followedArtists`).all()
  return result
}

async function getFollowStatus(id) {
  db = await getDB()
  let result = await db.prepare(`SELECT * FROM followedArtists WHERE id = ?`).all(id)
  if (result.length == 0) {
    return false
  } else {
    return true
  }
}

async function followArtist(id, idLatestRelease) {
  db = await getDB()
  db.prepare(`INSERT INTO followedArtists (id, idLatestRelease) VALUES (?, ?)`).run(id, idLatestRelease)
}

async function unfollowArtist(id) {
  db = await getDB()
  db.prepare(`DELETE FROM followedArtists WHERE id = ?`).run(id)
}

async function getSong(id) {
  db = await getDB()
  let result = await db.prepare(`SELECT * FROM songs WHERE id = ?`).all(id)
  return result
}

async function getSongLikeStatus(id) {
  db = await getDB()
  let result = await db.prepare(`SELECT * FROM playlistLikes WHERE id = ?`).all(id)
  return result
}
