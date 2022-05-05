const ytcog = require("ytcog");
const ytMusic = require("node-youtube-music");
const levenshtein = require("js-levenshtein");

module.exports = {
  convertURL,
  searchYoutubeMusic,
  getLevenshteinDistance,
};

//converts a youtube url to a streamable version that only contains an audio stream
async function convertURL(url) {
  var videoId = url.split("v=")[1];

  videoInfo = {
    id: videoId,
    audioQuality: "AUDIO_QUALITY_MEDIUM",
    container: "webm",
  };
  start = new Date();
  const session = new ytcog.Session();
  await session.fetch();
  const video = new ytcog.Video(session, videoInfo);
  await video.fetch();

  var audioStreams = video.audioStreams;
  var bestStreamIndex = 0;
  var bestBitrate = 0;

  for (let index = 0; index < audioStreams.length; index++) {
    const audioStream = audioStreams[index];

    if (
      audioStream.type != "audio" ||
      audioStream.quality == "AUDIO_QUALITY_LOW"
    ) {
      continue;
    }

    if (audioStream.bitrate < bestBitrate) {
      continue;
    }

    bestStreamIndex = index;
    bestBitrate = audioStream.bitrate;
  }

  time = new Date() - start;
  return audioStreams[bestStreamIndex].url;
}

//searches youtube Music for a song and returns the youtube information about the found results
async function searchYoutubeMusic(input) {
  start = new Date();
  const music = await ytMusic.searchMusics(input);
  time = new Date() - start;
  console.log("Execution time4: %dms", time);
  return music;
}

//calculates the levenshtein distance between two strings (used for determining the best search result)
async function getLevenshteinDistance(originString, comparisonString) {
  var result = await levenshtein(originString, comparisonString);
  return result;
}
