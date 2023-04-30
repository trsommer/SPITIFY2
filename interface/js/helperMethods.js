
/**
 * Returns a string of all the artists of a song.
 * @param {Array} artists - Array of artist objects.
 * @return {String|null} - Comma-separated string of artist names or null if input is invalid.
 */
function getArtistsAsString(artists) {
  if (!Array.isArray(artists) || artists.length === 0) {
    return null;
  }

  const artistNames = [];
  for (const artist of artists) {
    const artistName = artist.profile && artist.profile.name;
    if (artistName) {
      artistNames.push(artistName);
    }
  }

  return artistNames.join(", ");
}


/**
 * Checks if a streaming URL is expired by comparing the timestamp in the URL with the current time.
 * @param {string} url - The URL to check.
 * @returns {boolean} - True if the URL is expired, false otherwise.
 */
function checkIfUrlExpired(url) {
  const expired = new URL(url).searchParams.get("expire");
  const timeDelta = expired - Math.floor(Date.now() / 1000);
  return timeDelta < 0;
}

/**
 * Extracts the URL of the highest resolution image from the cover images of a song.
 * @param {Object} songInfo - Information about the song, including its album and cover images.
 * @returns {string} - The URL of the highest resolution cover image.
 */
function getImageCoverUrl(songInfo) {
  const images = songInfo.albumOfTrack.coverArt.sources;

  // Sort images by resolution in descending order
  images.sort((a, b) => b.width - a.width);

  // Return the URL of the first image
  return images.length > 0 ? images[0].url : '';
}


/**
 * Returns the ID of a song from the songInfo object
 * @param {Object} songInfo - The songInfo object
 * @returns {string} The ID of the song
 */
function getIdFromSongInfo(songInfo) {
  if (songInfo.id !== undefined && songInfo.id !== null) {
    return songInfo.id;
  }
  return songInfo.uri.split(":")[2];
}

/**
 * Shortens the string to the given length and appends "..." if necessary.
 * @param {string} str - The string to shorten.
 * @param {number} len - The maximum length of the shortened string.
 * @returns {string} The shortened string.
 */
function shortenString(str, len) {
  const strLen = str.length;
  return strLen > len ? str.substring(0, len) + "..." : str;
}

