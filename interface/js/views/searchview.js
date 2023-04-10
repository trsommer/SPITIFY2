var highlightSearchView = "";
var tracksHTML = []
songInfo = [];
var albums = [];
let artistsSearchView = [];
var searchPlayingTrack = null;

window.electronAPI.updateSpotifySearch((event, response) => {
  result = response.data.searchV2
  setContentSearch(result)
});

function search_view() {
  stopMenuLogoColorChange(false)
  updateSearchPlayingTrack()
  updateTopBarVisible(true);
}

function setContentSearch(content) {
  console.log(content);
  artists = content["artists"];
  songs = content["tracksV2"];
  albums = content["albums"];
  playlists = content["playlists"];
  setHighlightContent(artists);
  setOtherArtistsContent(artists);
  setSongsContent(songs);
  setAlbumContent(albums);
  setPlaylistContent(playlists);
}

function setHighlightContent(content) {
  mostRelevantContainer = document.getElementById("search_most_relevant_result_image_container");
  //remove element with id search_most_relevant_result_image_heading
  let element = document.getElementById("search_most_relevant_result_image_heading");
  if (element != null) {
    element.parentNode.removeChild(element);
  }
  let artistNameContainer = document.createElement("p");
  artistNameContainer.id = "search_most_relevant_result_image_heading";
  const data = content["items"]["0"]["data"];
  if (data == undefined) return;
  const avatarImage = data["visuals"]["avatarImage"];
  let url = "standardImages/cover.jpg";
  if (avatarImage != null) {
    url = avatarImage["sources"]["0"]["url"];
  }
  const artistName = data["profile"]["name"];
  const spotifyURI = data["uri"];
  const spotifyId = spotifyURI.replace("spotify:artist:", "");
  highlightSearchView = spotifyId;
  let artistNameLength = artistName.length;
  if (artistNameLength > 10) {
    //clear class list of artistNameContainer
    artistNameContainer.classList.remove("search_most_relevant_result_image_heading_big");
    artistNameContainer.classList.add("search_most_relevant_result_image_heading_small");
  } else {
    artistNameContainer.classList.remove("search_most_relevant_result_image_heading_small");
    artistNameContainer.classList.add("search_most_relevant_result_image_heading_big");
  }

  document.getElementById("search_most_relevant_image").src = url;
  artistNameContainer.innerHTML = artistName;
  mostRelevantContainer.appendChild(artistNameContainer);
}

function setOtherArtistsContent(content) {
  artists = content["items"];
  document.getElementById("search_results_artists").innerHTML = "";
  otherArtists = [];

  length = 4;
  if (artists.length < length) length = artists.length;

  for (let index = 0; index < length; index++) {
    const data = content["items"][index + 1]["data"];
    if (data == undefined) return;
    const id = "search_results_artist_" + index;
    const spotifyURI = data["uri"];
    const spotifyId = spotifyURI.replace("spotify:artist:", "");
    artistsSearchView[index] = spotifyId;
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

    artistImageContainer = document.createElement("div");
    artistImageContainer.classList.add("search_results_artist_image_container");

    artistImage = document.createElement("img");
    artistImage.classList.add("search_results_artist_image");
    artistImage.src = image;

    artistImageContainer.appendChild(artistImage);

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

    artistContainer.appendChild(artistImageContainer);
    artistContainer.appendChild(artistText);

    document
      .getElementById("search_results_artists")
      .appendChild(artistContainer);
    artistContainer.addEventListener("click", function () {
      openArtist(artistsSearchView[index]);
    });
  }
}

function setSongsContent(content) {
  songs = [];
  document.getElementById("search_section_songs_result").innerHTML = "";

  for (let index = 0; index < 5; index++) {
    if ((track = content["items"][index] == null)) {
      break;
    }
    track = content["items"][index]["item"]["data"];
    trackImageUrl = track["albumOfTrack"]["coverArt"]["sources"][0]["url"];
    trackName = track["name"];
    artists = track["artists"]["items"];
    artistString = "";
    songs[index] = track["id"];
    songInfo[index] = track;
    id = track.id

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

    songImageContainer = document.createElement("div");
    songImageContainer.classList.add("search_results_song_image_container");

    currentlyPlayingContainer = document.createElement("div");
    currentlyPlayingContainer.classList.add("currently_playing_container");
    currentlyPlayingContainer.classList.add("search_currently_playing_container")

    currentlyPlayingBackground = document.createElement("div");
    currentlyPlayingBackground.classList.add("currently_playing_background");

    currentlyPlayingImage = document.createElement("img");
    currentlyPlayingImage.classList.add("currently_playing_svg");
    currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

    if (currentSong != null && currentSong.getSongSpotifyId() == id) {
      currentlyPlayingContainer.style.display = "flex"; // show currently playing track
      searchPlayingTrack = {
          "id": id,
          "html": songContainer
      }       
  }
    currentlyPlayingContainer.appendChild(currentlyPlayingBackground);
    currentlyPlayingContainer.appendChild(currentlyPlayingImage);

    songImage = document.createElement("img");
    songImage.classList.add("search_result_track_image");
    songImage.src = trackImageUrl;

    songImageContainer.appendChild(songImage);
    songImageContainer.appendChild(currentlyPlayingContainer);

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
    songContainer.appendChild(songImageContainer);
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

    tracksHTML.push({id: id, html: songContainer})
  }
}

function setAlbumContent(content) {
  albums = content["items"];
  document.getElementById("search_results_albums").innerHTML = "";

  var length = 5;
  if (albums.length < length) length = albums.length;

  for (let index = 0; index < length; index++) {
    albumData = albums[index]["data"];
    if (albumData == undefined) break;
    albumName = albumData["name"];
    albumYear = albumData["date"]["year"];
    var imgUrl = albumData["coverArt"]["sources"]["0"]["url"];
    if (imgUrl == undefined) imgUrl = "standardImages/cover.jpg";

    albumContainer = document.createElement("div");
    albumContainer.classList.add("search_results_album");
    albumContainer.id = "search_results_album_" + index;

    albumImageContainer = document.createElement("div");
    albumImageContainer.classList.add("search_results_album_image_container");

    albumImage = document.createElement("img");
    albumImage.classList.add("search_results_album_image");
    albumImage.src = imgUrl;

    albumImageContainer.appendChild(albumImage);

    albumTextContainer = document.createElement("div");
    albumTextContainer.classList.add("search_results_album_text");

    albumTitle = document.createElement("p");
    albumTitle.classList.add("search_results_album_text_title");
    albumTitle.innerHTML = albumName;

    albumYearHTML = document.createElement("p");
    albumYearHTML.classList.add("search_results_album_text_type");
    albumYearHTML.innerHTML = albumYear;

    albumTextContainer.appendChild(albumTitle);
    albumTextContainer.appendChild(albumYearHTML);

    albumContainer.appendChild(albumImageContainer);
    albumContainer.appendChild(albumTextContainer);
    albumContainer.addEventListener("click", function () {
      openAlbum(index);
    });

    document
      .getElementById("search_results_albums")
      .appendChild(albumContainer);
  }
}

function setPlaylistContent(content) {
  playlists = content["items"];
  document.getElementById("search_results_playlists").innerHTML = "";

  var length = 5;
  if (playlists.length < length) length = playlists.length;

  for (let index = 0; index < length; index++) {
    playlistData = playlists[index]["data"];
    if (playlistData == undefined) break;
    playlistName = playlistData["name"];
    playlistOwner = playlistData["ownerV2"]["data"]["name"];
    var imgUrl = playlistData["images"]["items"]["0"]["sources"]["0"]["url"];
    if (imgUrl == undefined) imgUrl = "standardImages/cover.jpg";

    playlistContainer = document.createElement("div");
    playlistContainer.classList.add("search_results_album");
    playlistContainer.id = "search_results_album_" + index;

    playlistImageContainer = document.createElement("div");
    playlistImageContainer.classList.add("search_results_album_image_container");

    playlistImage = document.createElement("img");
    playlistImage.classList.add("search_results_album_image");
    playlistImage.src = imgUrl;

    playlistImageContainer.appendChild(playlistImage);

    playlistTextContainer = document.createElement("div");
    playlistTextContainer.classList.add("search_results_album_text");

    playlistTitle = document.createElement("p");
    playlistTitle.classList.add("search_results_album_text_title");
    playlistTitle.innerHTML = playlistName;

    plylistOwner = document.createElement("p");
    plylistOwner.classList.add("search_results_album_text_type");
    plylistOwner.innerHTML = playlistOwner;

    playlistTextContainer.appendChild(playlistTitle);
    playlistTextContainer.appendChild(plylistOwner);

    playlistContainer.appendChild(playlistImageContainer);
    playlistContainer.appendChild(playlistTextContainer);
    playlistContainer.addEventListener("click", function () {
      console.log(index);
    });

    document
      .getElementById("search_results_playlists")
      .appendChild(playlistContainer);
  }
}

function playSongSearchView(id) {
  playSongNow(songInfo[id]);
}

async function openAlbum(id) {
  var album = albums[id];
  var spotifyURI = album["uri"];
  var theSplit = spotifyURI.split(":");
  setupAlbumView(theSplit[2], album);
}

function searchSongCurrentlyPlaying(id) {
  if (searchPlayingTrack != null) {
    searchPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
    searchPlayingTrack = null;
      // if another track is playing, hide the currently playing icon from the previous track (playlistPlayingTrack)
  }

  for (let i = 0; i < tracksHTML.length; i++) {
      const trackHTML = tracksHTML[i];
      if (trackHTML.id == id) {
          trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
          searchPlayingTrack = trackHTML;
      }
  }
}

function updateSearchPlayingTrack() {
  if (searchPlayingTrack == null || currentSong == null) return; 
    
  if (searchPlayingTrack != null) {
    if (currentSong.getSongSpotifyId() != searchPlayingTrack.id) {
      oldId = searchPlayingTrack.id;
      for (let i = 0; i < tracksHTML.length; i++) {
        const trackHTML = tracksHTML[i];
        if (trackHTML.id == currentSong.getSongSpotifyId()) {
          trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
          searchPlayingTrack = trackHTML;
        }
        if (trackHTML.id == oldId) {
          trackHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
        }
      }
    }
  }
}

function searchRemoveCurrentlyPlaying() {
  if (searchPlayingTrack != null) {
    searchPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
    searchPlayingTrack = null;
  }
}

