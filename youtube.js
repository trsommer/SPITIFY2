const ytcog = require("ytcog")
const youtubedl = require("youtube-dl-exec")
const ytMusic = require("node-youtube-music")
const levenshtein = require("js-levenshtein")

module.exports = {
  convertURL,
  searchYoutubeMusic,
  getLevenshteinDistance
}

//converts a youtube url to a streamable version that only contains an audio stream
async function convertURL(url) {
  console.log(url)

  var videoId = url.split("v=")[1]

  videoInfo = {
    id: videoId,
    audioQuality: "highest",
    container: "webm"
  }
  const session = new ytcog.Session()
  await session.fetch()
  const video = new ytcog.Video(session, videoInfo)
  await video.fetch()

  var audioStreams = video.audioStreams

  if (audioStreams.length == 0) {
    //fallback to yt-dlp if the ytmusic api is unable to find a streamable version of the video

    return await convertURLFallback(url)
  }

  var bestStreamIndex = 0
  var bestBitrate = 0

  for (let index = 0; index < audioStreams.length; index++) {
    const audioStream = audioStreams[index]

    if (audioStream.type != "audio" || audioStream.quality == "AUDIO_QUALITY_LOW") {
      continue
    }

    if (audioStream.bitrate < bestBitrate) {
      continue
    }

    bestStreamIndex = index
    bestBitrate = audioStream.bitrate
  }

  return audioStreams[bestStreamIndex].url
}

async function convertURLFallback(url) {
  output = await youtubedl.exec(url, {
    getUrl: true,
    format: "bestaudio/best"
  })

  return output.stdout
}

//searches youtube Music for a song and returns the youtube information about the found results
async function searchYoutubeMusic(input) {
  start = new Date()
  const music = await ytMusic.searchMusics(input)
  time = new Date() - start
  console.log("Execution time4: %dms", time)
  return music
}

//calculates the levenshtein distance between two strings (used for determining the best search result)
async function getLevenshteinDistance(originString, comparisonString) {
  var result = await levenshtein(originString, comparisonString)
  return result
}
