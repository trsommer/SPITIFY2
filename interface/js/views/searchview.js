spotifyIds = [];
songInfo = [];
var albums = [];

function search_view() {}

function setContentSearch(content) {
  artists = content["artists"];
  songs = content["tracks"];
  albums = content["albums"];
  setHighlightContent(artists);
  setOtherArtistsContent(artists);
  setSongsContent(songs);
  setAlbumContent(albums);
}

function setHighlightContent(content) {
  data = content["items"]["0"];
  if (data == undefined) return;
  url = data["visuals"]["avatarImage"]["sources"]["0"]["url"];
  artistName = data["profile"]["name"];
  spotifyURI = data["uri"];
  spotifyIds["highlight"] = spotifyURI.replace("spotify:artist:", "");

  document.getElementById("search_most_relevant_image").src = url;
  document.getElementById(
    "search_most_relevant_result_image_heading"
  ).innerHTML = artistName;
}

function setOtherArtistsContent(content) {
  artists = content["items"];
  document.getElementById("search_results_artists").innerHTML = "";
  otherArtists = [];

  length = 3;
  if (artists.length < 3) length = artists.length;

  for (let index = 0; index < 3; index++) {
    data = content["items"][index + 1];
    if (data == undefined) return;
    var id = "search_results_artist_" + index;
    spotifyURI = data["uri"];
    otherArtists[index] = spotifyURI.replace("spotify:artist:", "");
    if (data["visuals"]["avatarImage"] == null) {
      image = "standardImages/cover.jpg";
    } else {
      image = data["visuals"]["avatarImage"]["sources"][0]["url"];
    }
    artistName = data["profile"]["name"];
    if (artistName == undefined) {
      console.error("artistName is undefined");
      return;
    }
    if (image == undefined) {
      image = "standardImages/cover.jpg";
      return;
    }

    artistContainer = document.createElement("div");
    artistContainer.classList.add("search_results_artist");
    artistContainer.id = id;

    artistImage = document.createElement("img");
    artistImage.classList.add("search_results_artist_image");
    artistImage.src = image;

    artistText = document.createElement("div");
    artistText.classList.add("search_results_artist_text");

    artistName = document.createElement("p");
    artistName.classList.add("search_results_artist_text_artist");
    artistName.innerHTML = data["profile"]["name"];

    artistType = document.createElement("p");
    artistType.classList.add("search_results_artist_text_type");
    artistType.innerHTML = "Artist";

    artistText.appendChild(artistName);
    artistText.appendChild(artistType);

    artistContainer.appendChild(artistImage);
    artistContainer.appendChild(artistText);

    document
      .getElementById("search_results_artists")
      .appendChild(artistContainer);
    console.log(index);
    artistContainer.addEventListener("click", function () {
      openArtist(index + 1);
    });
  }

  spotifyIds["otherArtists"] = otherArtists;
}

function setSongsContent(content) {
  songs = [];
  document.getElementById("search_section_songs_result").innerHTML = "";

  for (let index = 0; index < 5; index++) {
    if ((track = content["items"][index] == null)) {
      break;
    }
    track = content["items"][index]["track"];
    trackImageUrl = track["album"]["coverArt"]["sources"][0]["url"];
    trackName = track["name"];
    artists = track["artists"]["items"];
    artistString = "";
    songs[index] = track["id"];
    songInfo[index] = track;
    for (var j = 0; j < artists.length; j++) {
      if (j == 0) {
        artistString = artists["0"]["profile"]["name"];
      } else {
        artistString = artistString + ", " + artists[j]["profile"]["name"];
      }
    }
    trackTimeMS = track["duration"]["totalMilliseconds"];
    trackTimeFormated = timeConvert(trackTimeMS);

    songContainer = document.createElement("div");
    songContainer.classList.add("search_results_song");
    songContainer.id = "song_result_" + index;

    songNumberContainer = document.createElement("div");
    songNumberContainer.classList.add("search_results_song_number");

    songNumber = document.createElement("p");
    songNumber.innerHTML = index + 1;

    songImage = document.createElement("img");
    songImage.classList.add("search_result_track_image");
    songImage.src = trackImageUrl;

    songTextContainer = document.createElement("div");
    songTextContainer.classList.add("search_results_song_text");

    songTitle = document.createElement("p");
    songTitle.classList.add("search_results_song_text_title");
    songTitle.innerHTML = trackName;

    songArtist = document.createElement("p");
    songArtist.classList.add("search_results_song_text_artist");
    songArtist.innerHTML = artistString;

    songTime = document.createElement("p");
    songTime.classList.add("search_results_song_text_time");
    songTime.innerHTML = trackTimeFormated;

    songTextContainer.appendChild(songTitle);
    songTextContainer.appendChild(songArtist);

    songNumberContainer.appendChild(songNumber);

    songContainer.appendChild(songNumberContainer);
    songContainer.appendChild(songImage);
    songContainer.appendChild(songTextContainer);
    songContainer.appendChild(songTime);
    songContainer.addEventListener("click", function () {
      playSongSearchView(index);
    });

    songContainer.addEventListener("contextmenu", (e) => {
      setClickedSong(songInfo[index]);
      spawnSongMenu(e);
    });

    document
      .getElementById("search_section_songs_result")
      .appendChild(songContainer);
  }
}

function setAlbumContent(content) {
  albums = content["items"];
  document.getElementById("search_results_albums").innerHTML = "";

  for (let index = 0; index < 5; index++) {
    albumData = albums[index];
    if (albumData == undefined) break;
    albumName = albumData["name"];
    albumType = albumData["type"];
    console.log(albumType);
    var imgUrl = albumData["coverArt"]["sources"]["0"]["url"];
    if (imgUrl == undefined) imgUrl = "standardImages/cover.jpg";

    albumContainer = document.createElement("div");
    albumContainer.classList.add("search_results_album");
    albumContainer.id = "search_results_album_" + index;

    albumImage = document.createElement("img");
    albumImage.classList.add("search_results_album_image");
    albumImage.src = imgUrl;

    albumTextContainer = document.createElement("div");
    albumTextContainer.classList.add("search_results_album_text");

    albumTitle = document.createElement("p");
    albumTitle.classList.add("search_results_album_text_title");
    albumTitle.innerHTML = albumName;

    albumTypeHTML = document.createElement("p");
    albumTypeHTML.classList.add("search_results_album_text_type");
    albumTypeHTML.innerHTML = albumType;

    albumTextContainer.appendChild(albumTitle);
    albumTextContainer.appendChild(albumTypeHTML);

    albumContainer.appendChild(albumImage);
    albumContainer.appendChild(albumTextContainer);
    albumContainer.addEventListener("click", function () {
      openAlbum(index);
    });

    document
      .getElementById("search_results_albums")
      .appendChild(albumContainer);
  }
}

function playSongSearchView(id) {
  playSongWithoutCover(songInfo[id]);
}

async function openAlbum(id) {
  var album = albums[id];
  var spotifyURI = album["uri"];
  var theSplit = spotifyURI.split(":");
  setupAlbumView(theSplit[2], album);

  console.log(theSplit[2]);
  console.log(album);
}
