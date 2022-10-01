var songQueue = []; //songs to be played
var currentSong = null; //currently playing song
var playedQueue = []; //songs that have been played

async function playNewSong(info) {
  //new main method for adding new songs
  const song = await new Song(info)
  addToQueue(song)
  playQueue()
}




function addToQueue(song) {
  if (song == null) return;
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

  //no song is in queue
  if (songQueueLength == 0) {
    changePlayState();
    return;
  }

  //there are songs in queue but no song is currently playing
  if (songQueueLength > 0 && currentSong == null) {
    var song = await removeFromQueue();
    console.log(song.getSongTitle());
    await play(song);
    //updateVolumeSlider(song.getSongPreferredVolume() * 100); //update preferred volume
    sendNotification(song.getSongTitle(), song.getArtistsAsString());
  }
}

//adds a song to the front of the queue but keeps the songs that are already in the queue
function skipQueue(song) {
  songQueue.unshift(song);
  playQueue();
}

//deletes the queue and plays a new song
async function replaceQueue(song) {
  songQueue = [];
  finalSong = await song
  addToQueue(finalSong);
  playQueue();
}

//clears the song currently playing
function clearCurrentlyPlaying() {
  currentSong = null;
}

//clears the queue of songs to be played
function clearQueue() {
  songQueue = [];
}

//returns the song currently playing
function getCurrentSong() {
  return currentSong;
}

//returns, how many songs are in the queue
function getQueueLength() {
  return songQueue.length;
}

//adds a song to the played queue
function addToPlayedQueue(song) {
  playedQueue.push(song);
}

//returns the played queue
function getPlayedQueue() {
  return playedQueue;
}

//returns the song queue
function getQueue() {
  return songQueue;
}
