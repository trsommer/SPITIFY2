var songQueue = [];
var currentSong = null;
var playedQueue = [];

function addToQueue(song) {
  songQueue.push(song);
}

function getCurrentSong() {
  return currentSong;
}

async function removeFromQueue() {
  currentSong = await songQueue.shift();
  console.log(currentSong);
  return currentSong;
}

async function playQueue() {
  var songQueueLength = songQueue.length;

  if (songQueueLength == 0) {
    return;
  }

  if (songQueueLength > 0 && currentSong == null) {
    var song = await removeFromQueue();
    console.log(song.getSongTitle());
    await play(song);
    sendNotification(song.getSongTitle(), song.getArtistsAsString());
  }
}

function skipQueue(song) {
  songQueue.unshift(song);
  playQueue();
}

async function replaceQueue(song) {
  songQueue = [];
  finalSong = await song
  addToQueue(finalSong);
  playQueue();
}

function clearCurrentlyPlaying() {
  currentSong = null;
}

function clearQueue() {
  songQueue = [];
}

function getCurrentSong() {
  return currentSong;
}

function getQueueLength() {
  return songQueue.length;
}

function addToPlayedQueue(song) {
  playedQueue.push(song);
}

function getPlayedQueue() {
  return playedQueue;
}
