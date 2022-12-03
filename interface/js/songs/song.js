class Song {
  /*
    This class represents a playable song. It combines the information gained from the spotify api (songInfo)
    with the corresponding video from youtube music (songYoutube).
    */

  //Globals
  #songSpotifyId = "";
  #songTitle = "";
  #songArtistArray = [];
  #songType = "";
  #songAlbum = {};
  #songImageUrl = "";
  #songDuration = "";
  #songLyrics = ""; //not implemented yet but maybe in the future
  #songStreamingUrl = "";
  #songLocalLocation = "";
  #songYoutubeId = "";
  #songLikeStatus = false;
  #songPreferredVolume = 0.5;
  #songInfo = {};

  //Constructor

  constructor(songInfo, requestType) {
    return this.#constructorFunction(songInfo, requestType);
  }

  async #constructorFunction(songInfo, requestType) {
    await this.#setup(songInfo, requestType);
    return this;
  }

  //Setup

  async #setup(songInfo, requestType) {
    //requestType is either "stream", "download" or "empty" - if empty, steam is default
    this.#songSpotifyId = this.#getIdFromSongInfo(songInfo);

    //get possible info of song from db
    const databaseQueryResult = await this.#getInfoFromDB(this.#songSpotifyId);

    //check if song is in db
    if (databaseQueryResult.length == 1) {
      //song is in db
      await this.#setupSongDatabase(databaseQueryResult, requestType);
    } else {
      //song is not in db
      await this.#setupSongSpotify(songInfo, requestType);
    }

    return this;
  }

  async #setupSongDatabase(databaseQueryResult, requestType) {
    const dbInfo = databaseQueryResult[0];

    //set song info from db
    this.#setDBInfo(dbInfo);

    if (requestType == "download") {
      //check if song is downloaded
      if (this.#songLocalLocation == "") {
        //song is not downloaded
        const localLocation = await this.#downloadSong(); //TODO
        //set local location in globals
        this.#songLocalLocation = localLocation[0].filePath;

        console.log("local location: " + this.#songLocalLocation);
        //update db with local location
        this.#updateDB();
      } else {
        //maybe send notification that song is already downloaded //TODO
        console.log("song is already downloaded");
      }

      return
    }

    if (this.#songLocalLocation != "") {
      //song is downloaded
      return
    }


    //get if the url is expired
    const expired = this.#checkIfUrlExpired(this.#songStreamingUrl);
    //if url is expired, get new url
    if (expired) {
      this.#songStreamingUrl = await this.#getStreamingUrl(
        this.#songYoutubeId
      );

      //update db with new url
      this.#updateDB();
    }
  }

  async #setupSongSpotify(songInfo, requestType) {
    //set globals for this song object from songinfo
    await this.#setInfo(songInfo);
    //get youtube url
    const youtubeSong = await this.#getYoutubeSong();
    const youtubeSongId = youtubeSong.youtubeId;

    //set youtube url in globals
    this.#songYoutubeId = youtubeSongId;

    if (requestType == "download") {
      //download song
      const localLocation = await this.#downloadSong(); //TODO
      //set local location in globals
      this.#songLocalLocation = localLocation[0].filePath;

      console.log("local location: " + this.#songLocalLocation);
      //update db with local location
      this.#addToDB();

      return
    }

    //get streaming url
    const streamingUrl = await this.#getStreamingUrl(youtubeSongId);
    //set streaming url in globals
    this.#songStreamingUrl = streamingUrl;
    //add song to db
    this.#addToDB();
  }

  //Databasee

  async #getInfoFromDB(id) {
    const sql = `SELECT * FROM songs WHERE id = '${id}'`;
    console.log("sql: " + sql);
    const result = await getFromDB(sql);
    return result;
  }

  #setDBInfo(dbInfo) {
    const songData = JSON.parse(dbInfo.info);
    
    this.#songSpotifyId = dbInfo.id;
    this.#songTitle = songData.songTitle;
    this.#songArtistArray = JSON.parse(songData.songArtistArray);
    //this.#songType = songInfo.type;
    this.#songLocalLocation = songData.songLocalLocation;
    this.#songDuration = songData.songDuration;
    this.#songAlbum = songData.songAlbum;
    this.#songImageUrl = songData.songImageUrl;
    this.#songStreamingUrl = songData.songStreamingUrl;
    this.#songYoutubeId = songData.songYoutubeId;
    this.#songLikeStatus = songData.songLikeStatus;
    this.#songPreferredVolume = songData.songPreferredVolume;
    this.#songInfo = songData.songInfo;

  }

  #compileDBData() {
    const artistsJson = JSON.stringify(this.#songArtistArray);
    const dbData = {
      id: this.#songSpotifyId,
      songData: {
        songTitle: this.#songTitle,
        songArtistArray: artistsJson,
        //songType: this.#songType,
        songAlbum: this.#songAlbum,
        songImageUrl: this.#songImageUrl,
        songDuration: this.#songDuration,
        //songLyrics: this.#songLyrics,
        songStreamingUrl: this.#songStreamingUrl,
        songLocalLocation: this.#songLocalLocation,
        songYoutubeId: this.#songYoutubeId,
        songLikeStatus: this.#songLikeStatus,
        songPreferredVolume: this.#songPreferredVolume,
        songInfo: this.#songInfo,
      },
    };

    return dbData;
  }

  async #addToDB() {
    const dbData = this.#compileDBData();
    insertSong(dbData);
  }

  async #updateDB() {
    const dbData = this.#compileDBData();
    updateSong(dbData);
  }

  #setInfo(songInfo) {
    //sets the globals for this song object from songinfo
    this.#songTitle = songInfo.name;
    this.#songArtistArray = songInfo.artists;
    //this.#songType = songInfo.type;
    this.#songDuration = songInfo.duration.totalMilliseconds;
    this.#songAlbum = songInfo.album;
    this.#songImageUrl = this.#getImageCoverUrl(songInfo);
    this.#songLikeStatus = false;
    this.#songInfo = songInfo;
  }

  #getImageCoverUrl(songInfo) {
    //searches the cover images from spotify for the best resolution
    const images = songInfo.album.coverArt.sources;
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

  #checkIfUrlExpired(url) {
    //checks if a sreaming url is expired by comparing the timestamp in the url with the current time
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

  async #getYoutubeSong() {
    //construct search input for youtube search
    const searchInput = this.#songTitle + " by " + this.getArtistsAsString();

    //get different youtube results for search input
    const apiResponse = await getYoutubeUrls(searchInput);

    //get youtube url from api response
    const song = await this.#chooseCorrectSong(apiResponse);

    //return the (hopefully) correct youtube song
    return song;
  }

  async #chooseCorrectSong(apiResponse) {
    //updated for every song in youtube if song is closer to spotify song
    let closestMatchDeviation;
    let closestMatch;
    let searchResults = [];

    console.log(apiResponse);
    console.log(this);

    console.log("search: " + this.#songTitle);

    for (let i = 0; i < apiResponse.length; i++) {
      const song = apiResponse[i];
      /*
      comparisons (not ordered by importance):
        1. artists
        2. title
        3. album
        4. duration
        5. content rating
        6. ytResultPriority
      */

      //compare the artists (result is nr of found artists and a title that does not include featured artists)
      const spotifyArtists = this.#songArtistArray.items;
      const resultArtistComparison = await compareArtists(
        spotifyArtists,
        song.artists,
        song.title
      );

      const foundArtists = resultArtistComparison.nrFound;
      const artistNumberDeviation = Math.abs(
        resultArtistComparison.nrFound - spotifyArtists.length
      );
      const newTitle = resultArtistComparison.newTitle;

      //compare titles (result#is deviation as Levenshtein distance)
      const normalTitleComparison = await compareTitles(
        this.#songTitle,
        song.title 
      );

      const reducedTitleComparison = await compareTitles(
        this.#songTitle,
        newTitle 
      );

      const bracketLess = getBracketlessTitle(newTitle);
      let bracketLessComparison = 0;
      let resultTitleComparison = 0;

      if (!bracketLess) {
        resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison);

      } else {
        if (bracketLess.extractedText.includes(this.#songAlbum.name)) {
          bracketLessComparison = await compareTitles(
            this.#songTitle,
            bracketLess.cleanText
          );
  
          resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison, bracketLessComparison);
        } else {
          resultTitleComparison = Math.min(normalTitleComparison, reducedTitleComparison);

        }
      }


      //compare album titles (if song has album) (result is deviation as Levenshtein distance)
      let resultAlbumComparison;
      if (song.album != undefined && this.#songAlbum != undefined) {
        resultAlbumComparison = await albumTitleComparison(
          this.#songAlbum.name,
          song.album
        );
      }

      //compare duration (result is deviation in seconds)
      const timeDifference = compareSongDurations(
        this.#songDuration,
        song.duration.totalSeconds
      );

      //compare content rating (result is bool if matches)
      const resultContentRatingMatch = compareContentRatings(
        this.#songInfo.contentRating.label,
        song.isExplicit
      );

      var artistsContainNonLatinChars = artistsContainNonLatinCharacters(spotifyArtists, song.artists);

      //if content rating is not the same, the songs cant match
      if (resultContentRatingMatch == false || foundArtists == 0 && song.artists != 0 && !artistsContainNonLatinChars) {
        console.log("song does not match search criteria");
        continue;
      }

      //check if the songs are a perfect match
      if (
        resultTitleComparison == 0 &&
        resultContentRatingMatch == true &&
        artistNumberDeviation == 0
      ) {
        //song is a perfect match
        return song;
      }

      //check if the song is a better match than the current closest match
      const songDeviation =
        i * i * 0.5 +
        artistNumberDeviation * 3 +
        resultTitleComparison * 1.5 +
        resultAlbumComparison * 1.3 +
        timeDifference * 0.2;


      searchResults.push({
        title: this.#songTitle,
        ytTitle: song.title,
        newTitle: newTitle,
        normal: normalTitleComparison,
        reduced: reducedTitleComparison,
        bracketLess: bracketLessComparison,
        exracted: bracketLess.extractedText,
        album: this.#songAlbum.name,
        derivation: songDeviation,

      })

      if (
        closestMatchDeviation == undefined ||
        songDeviation < closestMatchDeviation
      ) {
        closestMatchDeviation = songDeviation;
        closestMatch = song;
      }
    }

    console.table(searchResults);

    return closestMatch;
  }

  async #getLikeStatusDb() {
    const response = await getFromDB(
      `SELECT * FROM playlistLikes WHERE id = '${this.#songSpotifyId}'`
    );
    if (response.length == 1) {
      return true;
    }
    return false;
  }

  async #getStreamingUrl(youtubeId) {
    const youtubeUrl = "https://www.youtube.com/watch?v=" + youtubeId;
    var streamingUrl = await getStreamingUrl(youtubeUrl);

    return streamingUrl;
  }

  async #downloadSong() {
    const fullTitle = this.getSongFullTitle();
    const youtubeId = this.#songYoutubeId;
    const spotifyId = this.#songSpotifyId;
    const songs = [{songName: fullTitle, youtubeId: youtubeId, spotifyId: spotifyId}];
  
    addDownloadToView(this);

    const location = await downloadSongs(songs);
    addDownloadedSong(spotifyId);

    return location;
  }

  getArtistsAsString() {
    const artists = this.#songArtistArray["items"];

    if (artists == []) {
      return null;
    }

    let returnString = "";

    if (artists == null || artists == undefined) {
      return null;
    }

    const artistsLength = Object.keys(artists).length;

    console.log(artistsLength);

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

  #getIdFromSongInfo(songInfo) {
    if (songInfo.id == undefined || songInfo.id == null) {
      return songInfo.uri.split(":")[2];
    }

    return songInfo.id;
  }

  likeSong() {
    switch (this.#songLikeStatus) {
      case true:
        //song was liked and is to be unliked
        this.#songLikeStatus = false;
        likeSongDb(this.#songSpotifyId, 1);
        this.#updateDB();
        return false;
      case false:
        //song was not liked and is to be liked
        this.#songLikeStatus = true;
        likeSongDb(this.#songSpotifyId, 0);
        this.#updateDB();
        return true;
    }
  }

  savePreferredVolume() {
    const currentVolume = getCurrentVolume() / 100;
    this.#songPreferredVolume = currentVolume;
    this.#updateDB(); //TODO: does not save
  }

  //getters

  getSpotifySongInfo() {
    return this.#songInfo;
  }

  getSongTitle() {
    return this.#songTitle;
  }

  getSongArtistArray() {
    return this.#songArtistArray;
  }

  getSongAlbum() {
    return this.#songAlbum;
  }

  getSongImageUrl() {
    return this.#songImageUrl;
  }

  getSongDuration() {
    return this.#songDuration;
  }

  getSongStreamingUrl() {
    if (this.#songLocalLocation == "") {
      return this.#songStreamingUrl;
    }
    return this.#songLocalLocation;

  }

  getSongYoutubeId() {
    return this.#songYoutubeId;
  }

  getSongLikeStatus() {
    return this.#songLikeStatus;
  }

  getSongPreferredVolume() {
    return this.#songPreferredVolume;
  }

  getSongInfo() {
    return this.#songInfo;
  }

  getSongFullTitle() {
    return this.#songTitle + " - " + this.getArtistsAsString();
  }

  getSongSpotifyId() {
    return this.#songSpotifyId;
  }

  getAlbumName() {
    return this.#songAlbum.name;
  }
}

