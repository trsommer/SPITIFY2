var songQueue = []
var currentSong = null

function addToQueue(song) {
    songQueue.push(song)
}

function getCurrentSong() {
    return currentSong
}

function removeFromQueue() {
    currentSong = songQueue.shift()
    console.log(currentSong)
    return currentSong
}

async function playQueue() {
    var songQueueLength = songQueue.length

    if (songQueueLength == 0) {
        return
    }

    if (songQueueLength > 0 && currentSong == null) {
        var song = removeFromQueue()
        console.log(song);
        song.play()
        sendNotification(song.getName(), song.getArtistsAsString())
    }
}

function skipQueue(song) {
    songQueue.unshift(song)
    playQueue()
}

function replaceQueue(song) {
    songQueue = []
    addToQueue(song)
    playQueue()
}

function clearCurrentlyPlaying() {
    currentSong = null
}

function clearQueue() {
    songQueue = []
}