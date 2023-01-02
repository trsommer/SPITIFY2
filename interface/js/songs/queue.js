var songQueue = []; //songs to be played
var currentSong = null; //currently playing song
var playedQueue = []; //songs that have been played

async function playNewSong(info) {
  //new main method for adding new songs
  const song = await new Song(info)
  addToQueue(song)
  playQueue()
}

async function playSongNow(info) {
  //plays a song now
  const song = await new Song(info)
  //if there is no song currently playing, play the song
  if (getCurrentSong() == null) {
    await addToQueue(song)
    await playQueue()
  }
  //if there is a song currently playing, add current song to played queue and play the new song
  else {
    const currentSong = getCurrentSong()
    addToPlayedQueue(currentSong)
    skipQueue(song)
    clearCurrentlyPlaying()
    playQueue()
    //changePlayState();
  }

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
    removeCurrentlyPlaying();
    return;
  }

  //there are songs in queue but no song is currently playing
  if (songQueueLength > 0 && currentSong == null) {
    var song = await removeFromQueue();
    console.log(song.getSongTitle());
    await play(song);
    //updateVolumeSlider(song.getSongPreferredVolume() * 100); //update preferred volume
  }
}

//adds a song to the front of the queue but keeps the songs that are already in the queue
function skipQueue(song) {
  songQueue.unshift(song);
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

function setCurrentSong(song) {
  currentSong = song;
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

function getLastPlayedSongInfo() {
  return playedQueue[playedQueue.length - 1].getSongInfo();
}