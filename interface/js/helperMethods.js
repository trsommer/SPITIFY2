
//returns a string of all the artists of a song
function getArtistsAsString(artists) {
    if (artists == null || artists == undefined || artists == []) {
        return null;
    }

    let returnString = "";
    const artistsLength = Object.keys(artists).length;

    for (let i = 0; i < artistsLength; i++) {
      const artist = artists[i];
      const artistName = artist["profile"]["name"];
      if (i == 0) {
        returnString = artistName;
      } else {
        returnString += ", " + artistName;
      }
    }

    return returnString;
}

//checks if a sreaming url is expired by comparing the timestamp in the url with the current time
function checkIfUrlExpired(url) {
    const split = url.split("videoplayback?");
    const params = new URLSearchParams(split[1]);
    const expired = params.get("expire");
    const currentTime = new Date().getTime() / 1000;
    const timeDelta = expired - currentTime;
    if (timeDelta < 0) {
      return true;
    }
    return false;
}


//extracts the highest resolution image from the cover images of a song
function getImageCoverUrl(songInfo) {
    //searches the cover images from spotify for the best resolution
    const images = songInfo.albumOfTrack.coverArt.sources;
    let bestResolution = 0;
    let bestImageUrl = "";

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      if (image.width == undefined) {
        return images[2].url;
      }

      if (image.width > bestResolution) {
        bestResolution = image.width;
        bestImageUrl = image.url;
      }
    }

    return bestImageUrl;
}

//gets the id of a song from the songinfo object
function getIdFromSongInfo(songInfo) {
    //check if songinfo.id is undefined

    if (songInfo["id"] == undefined) {
      return songInfo.uri.split(":")[2];
    }

    if (songInfo.id == null) {
      return songInfo.uri.split(":")[2];
    }

    return songInfo.id;
}