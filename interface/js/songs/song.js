class Song {
  #id = "";
  #name = "";
  #artists = [];
  #imageCoverUrl = "";
  #url = "";
  #youtubeId = "";
  #playstate = false;
  #length = 0;
  #albumName = ""
  #liked = false;

  constructor(songInfo) {
    return this.#constructorFunction(songInfo);
  }

  async #constructorFunction(songinfo) {
    await this.#setupSong(songinfo);
    console.log(songinfo);
    return this
  }

  async #setupSong(songInfo) {
    const streamingUrl = songInfo.streamingUrl;

    console.log(streamingUrl);

    if (streamingUrl != undefined) {
      var expired = false;
      expired = this.#checkIfUrlExpired(streamingUrl);
      this.#setDBInfo(songInfo);
      if (expired) {
        console.log("expired: " + expired);
        await this.#getYoutubeStreamingUrl(songInfo.youtubeID);
        await this.#updateStreamingUrl();
      }
      this.#startPlaying();
      return;
    }

    var id = songInfo.id;
    if (id == undefined) {
      var uri = songInfo["uri"];
      var id = uri.split(":")[2];
    }
    this.#id = id

    var expired = false
    var dbInfo = await this.#getInfoFromDB();

    if (dbInfo.length == 1) {
      this.#setDBInfo(dbInfo[0]);
      expired = this.#checkIfUrlExpired(dbInfo[0].streamingUrl);
      if (expired) {
        await this.#setURL();      }
    } else {
      await this.#setInfo(songInfo);
      await this.#setURL();
      await this.#addToDB();
    } 

    this.#startPlaying();
  }

  #startPlaying() {
    if (this.#playstate) {
      this.play();
    }

    this.#getLikeStatusDb();
  }

  #setDBInfo(dbInfo) {
    this.#name = dbInfo["title"];
    this.#artists = JSON.parse(dbInfo["artists"]);
    this.#imageCoverUrl = dbInfo["imageUrl"];
    this.#url = dbInfo["streamingUrl"];
    this.#youtubeId = dbInfo["youtubeID"];
    this.#length = dbInfo["duration"];
  }

  #checkIfUrlExpired(url) {
    var split = url.split("videoplayback?");
    let params = new URLSearchParams(split[1]);
    var expired = params.get("expire");
    var currentTime = new Date().getTime() / 1000;
    var timeDelta = expired - currentTime;
    if (timeDelta < 0) {
      return true;
    }
    return false;
  }

  async #getInfoFromDB() {
    var sql = `SELECT * FROM songs WHERE id = '${this.#id}'`;
    console.log("sql: " + sql);
    var result = await getFromDB(sql);
    return result;
  }

  async #setInfo(songInfo) {
    console.log(songInfo);
    console.log(songInfo["id"]);
    this.#name = songInfo["name"];
    this.#artists = songInfo["artists"];

    if (songInfo["album"] != undefined) {
      this.#albumName = songInfo["album"]["name"];
    } else {
      this.#albumName = "";
    }
    if (!("album" in songInfo)) {
      this.#imageCoverUrl = getAlbumCover();
      return;
    }
    this.#imageCoverUrl = songInfo["album"]["coverArt"]["sources"][0]["url"];
  }

  async #addToDB() {
    var artistsJson = JSON.stringify(this.#artists);
    data = {
      id: this.#id,
      title: this.#name,
      artists: artistsJson,
      album: "albumName",
      albumID: "albumid",
      youtubeID: this.#youtubeId,
      duration: this.#length,
      imageUrl: this.#imageCoverUrl,
      streamingUrl: this.#url,
    };
    insertSong(data);
  }

  async #updateStreamingUrl() {
    var url = this.#url;
    var id = this.#id;
    await updateStreamingUrl(id, url);
  }

  async #setURL() {
    var title = this.#name + " by " + this.getArtistsAsString();

    console.log(title);

    var response = await getYoutubeUrl(title);
    let song = await this.#getCurrectSong(response);
    var id = song["youtubeId"];
    console.log(id);
    this.#youtubeId = id;
    await this.#getYoutubeStreamingUrl(id);
  }

  async #getYoutubeStreamingUrl(youtubeId) {
    var url = "https://www.youtube.com/watch?v=" + youtubeId;
    var streamingUrl = await getStreamingUrl(url);

    this.#url = streamingUrl;
  }

  async #getCurrectSong(searchResults) {
    var closestMatchDeviation;
    var closestMatch;

    console.log(searchResults);
    console.log("searchResults");

    for(let i = 0; i < searchResults.length; i++) {
      var searchResult = searchResults[i];

      let albumName = searchResult.album
      let songName = searchResult.title
      
      let songNameDistance = await getLevenshteinDistance(this.#name, songName);
      console.log(this.#name + " - " + songName + " " + songNameDistance);

      let albumNameDistance = await getLevenshteinDistance(this.#albumName, albumName)
      console.log(this.#albumName + " - " + albumName + " " + albumNameDistance);

      let deviation = i+1 + songNameDistance * 3 + albumNameDistance
      console.log(deviation);

      if (closestMatchDeviation == undefined || closestMatchDeviation > deviation) {
        closestMatchDeviation = deviation
        closestMatch = searchResult
      }
    }

    console.log(closestMatchDeviation + " " + closestMatch);

    return closestMatch;
  }

  #timeConvert(ms) {
    var seconds = Math.floor(ms / 1000);

    //seconds to minutes
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    var remainingSecondsString = "" + remainingSeconds;

    if (remainingSeconds.toString().length == 1) {
      remainingSecondsString = "0" + remainingSeconds;
    }

    return "" + minutes + ":" + remainingSecondsString;
  }

  async #getLikeStatusDb() {
    var response = await getFromDB(`SELECT * FROM playlistLikes WHERE id = '${this.#id}'`);
    if (response.length == 1) {
        this.#liked = true;
    }

    setLikeIcon(this.#liked);
  }

  getLikeStatus() {
    return this.#liked;
  }

  getArtistsAsString() {
    var artists = this.#artists["items"];

    if (artists == []) {
      return null;
    }

    var returnString = "";

    if (artists == null || artists == undefined) {
      return null;
    }

    var artistsLength = Object.keys(artists).length;

    console.log(artistsLength);

    for (let i = 0; i < artistsLength; i++) {
      const artist = artists[i];
      var name = artist["profile"]["name"];
      if (i == 0) {
        returnString = name;
      } else {
        returnString += ", " + name;
      }
    }

    return returnString;
  }

  setUrl(url) {
    this.#url = url;
  }

  getName() {
    return this.#name;
  }

  getArtists() {
    return this.#artists;
  }

  getUrl() {
    return this.#url;
  }

  getImageCoverUrl() {
    return this.#imageCoverUrl;
  }

  getLength() {
    return this.#length;
  }

  addToQueue() {
    addToQueue(this);
  }

  async play() {
    console.log("play");
    if (this.#url != "") {
      var audio = document.getElementById("menu_player_audio");

      audio.src = this.#url;
      this.#addToPlayer();
      setVolume();
      changePlayState();
      animatePlayerIn()
    } else {
      this.#playstate = true;
    }
  }

  #addToPlayer() {
    var playerImage = document.getElementById("menu_player_cover");
    playerImage.src = this.#imageCoverUrl;
    setPlayerText(this.#name, this.getArtistsAsString());
  }

  likeSong() {
    switch(this.#liked) {
        case true:
          console.log("unliked the song");
          this.#liked = false;
          likeSongDb(this.#id, 1);
          setLikeIcon(false);
          break;
        case false:
          console.log("liked the song");
          this.#liked = true;
          likeSongDb(this.#id, 0);
          setLikeIcon(true);
          break;
    }
  }
}
