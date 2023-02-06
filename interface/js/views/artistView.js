var topSongs = [];
var topSongsHTML = [];
var scrolledDown = false;
var headerImageVisible = true;
var albums = [];
var singlesEps = [];
var linkedArtists = [];
var additionalSongInfo;
var menuLogoColorChangeStopped = false;
var accentColor = "";
var appropriateNrAlbumsCarousel = 4;
var artistPlayingTrack = null;

function artist_view() {
  setTopMenuOpacity(0);
  stopMenuLogoColorChange(true);
  repositionPlayer(12, 0);
}

function scrollArtistView(scrollY) {
  if (scrollY > 300 && !scrolledDown) {
    scrolledDown = true;
    changeMenuTopVisibility(false);
    repositionPlayer(12, 60);
  } else if (scrollY <= 300 && scrolledDown) {
    scrolledDown = false;
    changeMenuTopVisibility(true);
    repositionPlayer(12, 0);
  }
}

function toggleVisibility(id, bool) {
  var element = document.getElementById(id);

  if (bool == false) {
    element.style.display = "none";
  } else {
    element.style.display = "block";
  }
}

async function loadImage(url, elem) {
  return new Promise((resolve, reject) => {
    elem.onload = () => resolve(elem);
    elem.onerror = reject;
    elem.src = url;
  });
}

async function setContentArtist(content) {
  artistName = content["profile"]["name"];
  headerImage = document.getElementById("av_header_image");

  if (content.visuals.headerImage != null) {
    bgImage = content["visuals"]["headerImage"]["sources"]["0"]["url"];
    headerImage.classList.add("av_header_image");
    headerImage.classList.remove("av_header_image_square");
  } else {
    bgImage = content["visuals"]["avatarImage"]["sources"]["0"]["url"];
    headerImage.classList.add("av_header_image_square");
    headerImage.classList.remove("av_header_image");
  }

  //alternativeTitleElem = document.getElementById("top_container_alternativeTitle");

  console.log(content);

  console.log(artistName);
  console.log(bgImage);

  document.getElementById("av_artist_header_text").innerHTML = artistName;
  //alternativeTitleElem.innerHTML = artistName;

  //widthText = alternativeTitleElem.offsetWidth; //title top width
  //marginLeft = "-" + widthText + "px";
  //alternativeTitleElem.style.marginLeft = marginLeft;

  //document.documentElement.style.setProperty("--alternativeTitleMarginLeft",marginLeft);

  bgImageElem = document.getElementById("av_header_image");
  await loadImage(bgImage, bgImageElem);
  colorString = await getColors("av_header_image");

  document.getElementById("av_backgroundImage").src = bgImage;

  document.documentElement.style.setProperty("--accentColor", colorString);

  accentColor = colorString;

  setMusicPreviewContent(content.discography);

  appropiateDims = calculateAppropriateAlbumCarouselWidth();

  carouselWidth = appropiateDims.carouselWidth;

  appropriateNrAlbumsCarousel = appropiateDims.nrAlbums;

  setArtistAlbumContent(content.discography, carouselWidth);

  setArtistSinglesEpContent(content.discography, carouselWidth);

  setArtistBiography(content);

  detHiddenItems(artistName);
}

function setMusicPreviewContent(content) {
  document.getElementById("av_music_preview_container").innerHTML = "";

  console.log(content);

  let latest = content.latest;
  var layout = 2;

  if (latest == null) {
    layout = 3;
  }

  if (layout == 2) {
    spawnLatestRelease(latest);
  }

  console.log(layout);

  spawnPopularSongs(content.topTracks.items, layout);
}

function spawnLatestRelease(content) {
  console.log(content);
  let container = document.createElement("div");
  container.id = "av_music_preview_newRelease";

  let heading = document.createElement("h2");
  heading.innerHTML = "Latest Release";
  heading.id = "av_music_preview_heading";

  let releaseCenterContainer = document.createElement("div");
  releaseCenterContainer.id = "av_music_preview_newRelease_content_container";

  let releaseContainer = document.createElement("div");
  releaseContainer.id = "av_music_preview_newRelease_content";

  let releaseImageContainer = document.createElement("div");
  releaseImageContainer.id = "av_music_preview_newRelease_poster_container";

  let releaseImage = document.createElement("img");
  releaseImage.classList.add("av_music_cover_big");
  releaseImage.id = "av_music_preview_newRelease_poster";
  releaseImage.src = content.coverArt.sources[2].url;

  releaseImageContainer.appendChild(releaseImage);

  let releaseTextContainer = document.createElement("div");
  releaseTextContainer.id = "av_music_cover_big_text";

  let releaseTitle = document.createElement("h3");
  releaseTitle.id = "av_music_preview_newRelease_name";
  releaseTitle.innerHTML = content.name;

  let releaseSongNumber = document.createElement("p");
  releaseSongNumber.id = "av_music_preview_newRelease_nrSongs";

  let trackNumber = content.tracks.totalCount;

  if (trackNumber == 1) {
    releaseSongNumber.innerHTML = trackNumber + " Song";
  } else {
    releaseSongNumber.innerHTML = trackNumber + " Songs";
  }

  let releaseYear = document.createElement("p");
  releaseYear.id = "av_music_preview_newRelease_date";
  releaseYear.innerHTML = content.date.year;

  releaseTextContainer.appendChild(releaseTitle);
  releaseTextContainer.appendChild(releaseSongNumber);
  releaseTextContainer.appendChild(releaseYear);

  releaseContainer.appendChild(releaseImageContainer);
  releaseContainer.appendChild(releaseTextContainer);

  releaseContainer.addEventListener("click", function () {
    id = content.id;
    setArtistOpenedFrom();
    setupAlbumView(id, content);
  });

  releaseCenterContainer.appendChild(releaseContainer);

  container.appendChild(heading);
  container.appendChild(releaseCenterContainer);

  document.getElementById("av_music_preview_container").appendChild(container);
}

function spawnPopularSongs(content, layout) {
  topSongs = content;
  songIds = [];

  for (let i = 0; i < topSongs.length; i++) {
    const topSong = topSongs[i];

    id = topSong.track.id;
    songIds.push(id);
  }

  additionalSongInfo = getSongInfo(songIds);

  let container = document.createElement("div");
  container.id = "av_music_preview_musicShowcase_" + layout;

  let heading = document.createElement("h2");
  heading.id = "av_music_preview_heading";
  heading.innerHTML = "Popular Songs";

  let trackContainer = document.createElement("div");
  trackContainer.id = "av_music_preview_musicShowcase_content_" + layout;

  let trackColumnNumber = layout;

  if (layout * 3 > content.length) {
    trackColumnNumber = Math.ceil(content.length / 3);
  }

  var totalTrackNumber = Math.min(layout * 3, content.length);
  var currentTrack = 0;

  for (let i = 0; i < trackColumnNumber; i++) {
    let trackNumber = 3;

    if (totalTrackNumber - 3 < 0) {
      trackNumber = totalTrackNumber;
    } else {
      totalTrackNumber -= 3;
    }

    let tracksContainer = document.createElement("div");
    tracksContainer.classList.add("av_music_preview_musicShowcase_tracks");

    for (let j = 0; j < trackNumber; j++) {
      let trackContent = content[currentTrack].track;
      let realTrackNumber = 3 * i + j;
      id = trackContent.id;

      let thisTrackContainer = document.createElement("div");
      thisTrackContainer.classList.add("av_music_preview_musicShowcase_track");

      let trackImageContainer = document.createElement("div");
      trackImageContainer.classList.add("av_music_preview_musicShowcase_trackIMGContainer");

      let trackImage = document.createElement("img");
      trackImage.classList.add("av_music_preview_musicShowcase_trackIMG");

      currentlyPlayingContainer = document.createElement("div");
      currentlyPlayingContainer.classList.add("currently_playing_container");
      currentlyPlayingContainer.classList.add("av_music_preview_currently_playing_container")

      currentlyPlayingBackground = document.createElement("div");
      currentlyPlayingBackground.classList.add("currently_playing_background");

      currentlyPlayingImage = document.createElement("img");
      currentlyPlayingImage.classList.add("currently_playing_svg");
      currentlyPlayingImage.src = "icons/spitifyAnimated.svg";

      if (currentSong != null && currentSong.getSongSpotifyId() == id) {
        currentlyPlayingContainer.style.display = "flex"; // show currently playing track
        artistPlayingTrack = {
            "id": id,
            "html": thisTrackContainer
        }       
    }

      currentlyPlayingContainer.appendChild(currentlyPlayingBackground);
      currentlyPlayingContainer.appendChild(currentlyPlayingImage);

      trackImageContainer.appendChild(trackImage);
      trackImageContainer.appendChild(currentlyPlayingContainer);

      let imageUrl = trackContent.albumOfTrack.coverArt.sources[2].url;

      if (imageUrl == undefined) {
        imageUrl = "standardImages/cover.jpg";
      }

      trackImage.src = trackContent.albumOfTrack.coverArt.sources[2].url;
      let trackTextContainer = document.createElement("div");
      trackTextContainer.classList.add(
        "av_music_preview_musicShowcase_trackText"
      );

      let trackTitle = document.createElement("h4");
      trackTitle.innerHTML = trackContent.name;

      let trackDurationText = document.createElement("p");
      let duration = parseInt(trackContent.duration.totalMilliseconds);
      let durationText = timeConvert(duration);
      trackDurationText.innerHTML = durationText;

      thisTrackContainer.addEventListener("click", function () {
        playArtistTopTrack(trackContent, realTrackNumber);
      });

      thisTrackContainer.addEventListener("contextmenu", (e) => {
        openArtistContextMenu(trackContent, realTrackNumber, e);
      });

      trackTextContainer.appendChild(trackTitle);
      trackTextContainer.appendChild(trackDurationText);

      thisTrackContainer.appendChild(trackImageContainer);
      thisTrackContainer.appendChild(trackTextContainer);

      tracksContainer.appendChild(thisTrackContainer);

      topSongsHTML.push({id: id, html: thisTrackContainer})

      currentTrack++;
    }

    trackContainer.appendChild(tracksContainer);
  }

  container.appendChild(heading);
  container.appendChild(trackContainer);

  document.getElementById("av_music_preview_container").appendChild(container);
}

function setArtistAlbumContent(content, width) {
  albums = [];
  const albumCarousel = document.getElementById("av_albums_carousel");
  albumCarousel.style.width = width + "px";
  albumCarousel.innerHTML = "";

  if (content.albums == undefined || content.albums.items.length == 0) {
    console.log("No albums found");
    document.getElementById("av_albums_container").style.display = "none";
    return;
  } else {
    console.log("Albums found");
    document.getElementById("av_albums_container").style.display = "flex";
  }

  let albumContent = content.albums.items;

  if (albumContent.length >= appropriateNrAlbumsCarousel) {
    albumCarousel.style.justifyContent = "left";
  } else {
    albumCarousel.style.justifyContent = "center";
  }

  /*
      <div class="av_album_container">
        <div class="av_album_background">
            <img class="av_album_cover_image" src="standardImages/cover.jpg" alt="">
            <p class="av_album_heading"></p>
            <p class="av_album_info"></p>
        </div>                            
    </div>
    */

  for (let i = 0; i < albumContent.length; i++) {
    content = albumContent[i].releases.items[0];
    albums.push(content);

    let albumContainer = document.createElement("div");
    albumContainer.classList.add("av_album_container");

    let albumBackground = document.createElement("div");
    albumBackground.classList.add("av_album_background");

    albumImageContainer = document.createElement("div");
    albumImageContainer.classList.add("av_album_image_container");

    let albumCoverImage = document.createElement("img");
    albumCoverImage.classList.add("av_album_cover_image");
    albumCoverImage.src = getAlbumImageCoverUrl(content);

    albumImageContainer.appendChild(albumCoverImage);

    let albumHeading = document.createElement("p");
    albumHeading.classList.add("av_album_heading");

    albumName = content.name;

    if (albumName.length > 15) {
      albumName = albumName.substring(0, 15) + "...";
    }

    albumHeading.innerHTML = albumName;

    let albumInfo = document.createElement("p");
    albumInfo.classList.add("av_album_info");
    albumInfo.innerHTML = content.date.year;

    albumBackground.addEventListener("click", function () {
      setArtistOpenedFrom();
      openArtistAlbum(i);
    });

    albumBackground.appendChild(albumImageContainer);
    albumBackground.appendChild(albumHeading);
    albumBackground.appendChild(albumInfo);

    albumContainer.appendChild(albumBackground);

    albumCarousel.appendChild(albumContainer);
  }

  spawnArtistAlbumNavigator(albumContent.length, appropriateNrAlbumsCarousel);
}

function spawnArtistAlbumNavigator(albumNr, albumAppropriateNr) {
  const albumCarouselElement = document.getElementById("av_albums_carousel");
  const navigatorContainer = document.getElementById("av_albums_navigation");
  let nrBigNavigators = 0;
  if (albumNr >= albumAppropriateNr) {
    nrBigNavigators = parseInt(albumNr / albumAppropriateNr);
  } else {
    return;
  }

  const widthSmallNavigator = (80 / albumAppropriateNr) * (albumNr % albumAppropriateNr);

  navigatorContainer.innerHTML = "";

  for (let i = 0; i < nrBigNavigators; i++) {
    let bigNavigator = document.createElement("div");
    bigNavigator.classList.add("av_album_navigator");
    correctWidth = 20 * albumAppropriateNr;
    bigNavigator.style.width = correctWidth + "px";

    bigNavigator.addEventListener("click", function () {
      scrollWidth = 300 * albumAppropriateNr * i;
      albumCarouselElement.scrollTo({ left: scrollWidth, behavior: "smooth" });
    });

    navigatorContainer.appendChild(bigNavigator);
  }

  if (albumNr % albumAppropriateNr != 0 && albumNr > albumAppropriateNr) {
    let smallNavigator = document.createElement("div");
    smallNavigator.classList.add("av_album_navigator");
    smallNavigator.style.width = widthSmallNavigator + "px";

    smallNavigator.addEventListener("click", function () {
      albumCarouselElement.scrollTo({ left: 100000, behavior: "smooth" });
    });

    navigatorContainer.appendChild(smallNavigator);
  }
}

function setArtistSinglesEpContent(content, width) {
  singlesEps = [];
  const singlesEpCarousel = document.getElementById("av_singles_EPs_carousel");
  singlesEpCarousel.style.width = width + "px";
  singlesEpCarousel.innerHTML = "";

  console.log(content);

  const singlesContent = content.singles.items;

  if (singlesContent.length == 0) {
    document.getElementById("av_singles_EPs_container").style.display = "none";
    return;
  } else {
    document.getElementById("av_singles_EPs_container").style.display = "flex";
  }

  if (singlesContent.length >= appropriateNrAlbumsCarousel) {
    singlesEpCarousel.style.justifyContent = "left";
  } else {
    singlesEpCarousel.style.justifyContent = "center";
  }

  for (let i = 0; i < singlesContent.length; i++) {
    const track = singlesContent[i];
    const info = track.releases.items[0];
    singlesEps.push(info);

    /*
      <div class="av_album_container">
        <div class="av_album_background">
            <img class="av_album_cover_image" src="standardImages/cover.jpg" alt="">
            <p class="av_album_heading"></p>
            <p class="av_album_info"></p>
        </div>                            
    </div>
    */

    const albumContainer = document.createElement("div");
    albumContainer.classList.add("av_album_container");

    const albumBackground = document.createElement("div");
    albumBackground.classList.add("av_album_background");

    const albumImageContainer = document.createElement("div");
    albumImageContainer.classList.add("av_album_image_container");

    const albumCoverImage = document.createElement("img");
    albumCoverImage.classList.add("av_album_cover_image");
    albumCoverImage.src = getAlbumImageCoverUrl(info);

    albumImageContainer.appendChild(albumCoverImage);

    const albumHeading = document.createElement("p");
    albumHeading.classList.add("av_album_heading");

    albumName = info.name;

    if (albumName.length > 15) {
      albumName = albumName.substring(0, 15) + "...";
    }

    albumHeading.innerHTML = albumName;

    const albumInfo = document.createElement("p");
    albumInfo.classList.add("av_album_info");
    albumInfo.innerHTML = info.date.year + " - " + info.type;

    albumBackground.addEventListener("click", function () {
      setArtistOpenedFrom();
      openArtistSingleEp(i);
    });

    albumBackground.appendChild(albumImageContainer);
    albumBackground.appendChild(albumHeading);
    albumBackground.appendChild(albumInfo);

    albumContainer.appendChild(albumBackground);

    singlesEpCarousel.appendChild(albumContainer);
  }
  spawnArtistSingesNavigator(singlesContent.length, appropriateNrAlbumsCarousel);
}

function spawnArtistSingesNavigator(singlesNr, singlesAppropritateNr) {
  const singlesEPsCarouselElement = document.getElementById(
    "av_singles_EPs_carousel"
  );
  const navigatorContainer = document.getElementById("av_singles_navigation");
  let nrBigNavigators = 0;
  if (singlesNr >= singlesAppropritateNr) {
    nrBigNavigators = parseInt(singlesNr / singlesAppropritateNr);
  }
  const widthSmallNavigator = (80 / singlesAppropritateNr) * (singlesNr % singlesAppropritateNr);

  navigatorContainer.innerHTML = "";

  for (let i = 0; i < nrBigNavigators; i++) {
    let bigNavigator = document.createElement("div");
    bigNavigator.classList.add("av_singles_navigator");
    correctWidth = 20 * singlesAppropritateNr;
    bigNavigator.style.width = correctWidth + "px";

    bigNavigator.addEventListener("click", function () {
      scrollWidth = 300 * singlesAppropritateNr * i;
      singlesEPsCarouselElement.scrollTo({
        left: scrollWidth,
        behavior: "smooth",
      });
    });

    navigatorContainer.appendChild(bigNavigator);
  }

  if (singlesNr % singlesAppropritateNr != 0 && singlesNr > singlesAppropritateNr) {
    let smallNavigator = document.createElement("div");
    smallNavigator.classList.add("av_singles_navigator");
    smallNavigator.style.width = widthSmallNavigator + "px";

    smallNavigator.addEventListener("click", function () {
      singlesEPsCarouselElement.scrollTo({ left: 100000, behavior: "smooth" });
    });

    navigatorContainer.appendChild(smallNavigator);
  }
}

function setArtistBiography(content) {
  text = content.profile.biography.text;

  if (text == undefined || text == "") {
    text = "No biography found";
  }

  const biographyTextContainer = document.getElementById(
    "av_bio_description_text_container"
  );
  const image = document.getElementById("av_bio_gallery_image");
  const bgImage = document.getElementById("av_bio_background_Image");
  biographyTextContainer.innerHTML = replaceText(text);

  console.log(content.visuals.gallery);

  if (content.visuals.gallery.items.length > 0) {
    document.getElementById("av_bio_gallery").style.display = "flex";
    document.getElementById("av_bio_description").style.width = "60%";
    const imageUrl = content.visuals.gallery.items[0].sources[0].url;

    image.src = imageUrl;
    bgImage.src = imageUrl;
  } else {
    document.getElementById("av_bio_gallery").style.display = "none";
    document.getElementById("av_bio_description").style.width = "100%";
    image.src = "";
    bgImage.src = "";
  }
}

function replaceText(text) {
  let replacementTags = [];
  split = text.split("<a");

  newText = "";

  for (let i = 0; i < split.length; i++) {
    const splitString = split[i];
    if (i == 0) {
      newText += splitString;
      continue;
    }

    split2 = splitString.split("</a>");

    replacementTag = getReplacementTag(split2[0], i);

    newText += replacementTag + split2[1];
  }

  console.log(linkedArtists);

  return newText;
}

function getReplacementTag(str, index) {
  let firstQuotationMark = str.indexOf('"') + 1;
  let secondQuotationMark = nth_ocurrence(str, '"', 2);
  let spotifyId = str
    .substring(firstQuotationMark, secondQuotationMark)
    .split(":")[2];

  let firstOcurrence = str.indexOf(">") + 1;
  let info = str.substring(firstOcurrence, str.length);

  console.log(str);

  if (!str.includes("artist")) {
    return info;
  }

  let replacementTag = `<div class="av_bio_button" onclick="openArtist('${spotifyId}')">${info}</div>`;
  linkedArtists.push({ id: spotifyId, name: info });

  return replacementTag;
}

function nth_ocurrence(str, char, n) {
  for (let i = 0; i < str.length; i++) {
    if (str[i] == char) {
      if (!--n) {
        return i;
      }
    }
  }
  return false;
}

function getAlbumImageCoverUrl(albumContent) {
  if (albumContent.coverArt == undefined) {
    return "standardImages/cover.jpg";
  }

  sources = albumContent.coverArt.sources;

  for (let i = 2; i > 0; i--) {
    if (sources[i].url != undefined) {
      return sources[i].url;
    }
    return "standardImages/cover.jpg";
  }
}

function playTopSong(id) {
  console.log("playTopSong" + id);
  console.log(topSongs);
  playSong(topSongs[id]["track"]);
}

async function openArtist(id) {
  spotifyID = "";

  //window.scrollTo({ top: 0, behavior: 'smooth' });

  if (isInt(id)) {
    if (id == 0) {
      spotifyID = spotifyIds["highlight"];
    } else {
      spotifyID = spotifyIds["otherArtists"][id - 1];
    }
  } else {
    spotifyID = id;
  }

  responseArtist = await getSpotifyArtist(spotifyID);

  await setContentArtist(responseArtist);

  switchView("artist_view");
  addLastSearch(
    "artist",
    responseArtist["profile"]["name"],
    responseArtist["id"],
    responseArtist["visuals"]["avatarImage"]["sources"][0]["url"],
    ""
  );
}

function openHighlightArtist() {
  openArtist(0);
}

function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

async function playArtistTopTrack(content, songNumber) {
  const id = content.id;
  const additionalInfo = await additionalSongInfo;

  content.album = additionalInfo.data.tracks[songNumber].albumOfTrack;
  playSongNow(content);
}

async function playArtistTopSongs() {
  //self explanatory

  for (let index = 0; index < topSongs.length; index++) {
    let track = topSongs[index].track;
    const additionalInfo = await additionalSongInfo;
    track.album = additionalInfo.data.tracks[index].albumOfTrack;

    if (index == 0) {
      await playSongNow(track);
    } else {
      song = await new Song(track);
      addToQueue(song);
    }
  }
}

function openArtistAlbum(id) {
  console.log(albums);
  info = albums[id];
  console.log(info);
  uri = info.uri;
  id = uri.split(":")[2];
  setupAlbumView(id, info);
}

function openArtistSingleEp(id) {
  console.log(singlesEps);
  info = singlesEps[id];
  console.log(info);
  uri = info.uri;
  id = uri.split(":")[2];
  setupAlbumView(id, info);
}

async function openArtistContextMenu(track, trackNr, event) {
  const additionalInfo = await additionalSongInfo;
  track.album = additionalInfo.data.tracks[trackNr].albumOfTrack;

  setClickedArtistTopSong(track);
  spawnArtistMenu(event);
}

function setArtistOpenedFrom() {
  info = {
    accentColor: accentColor,
    title: artistName,
  };

  setOpenedFrom("artist_view", info);
}

function calculateAppropriateAlbumCarouselWidth() {
  const albumWidth = 300;
  const contentWidth = window.innerWidth - 60 - 12; //60 = menuLeft, 12 = scrollBar
  const nrAlbums = Math.floor((contentWidth - 50) / albumWidth);

  const carouselWidth = nrAlbums * albumWidth;

  return {
    carouselWidth: carouselWidth,
    nrAlbums: nrAlbums
  };
}

async function recalculateAlbumCarouselWidth() {
  const appropriateDims = calculateAppropriateAlbumCarouselWidth();

  if (appropriateDims.nrAlbums == appropriateNrAlbumsCarousel) {
    return;
  }

  const albumCarousel = document.getElementById("av_albums_carousel");
  albumCarousel.style.width = appropriateDims.carouselWidth + "px";

  const singlesEpCarousel = document.getElementById("av_singles_EPs_carousel");
  singlesEpCarousel.style.width = appropriateDims.carouselWidth + "px";

  spawnArtistAlbumNavigator(albums.length, appropriateDims.nrAlbums);

  spawnArtistSingesNavigator(singlesEps.length, appropriateDims.nrAlbums);

  appropriateNrAlbumsCarousel = appropriateDims.nrAlbums;

  if (albums.length >= appropriateDims.nrAlbums) {
    albumCarousel.style.justifyContent = "left";
  } else {
    albumCarousel.style.justifyContent = "center";
  }

  if (singlesEps.length >= appropriateDims.nrAlbums) {
    singlesEpCarousel.style.justifyContent = "left";
  } else {
    singlesEpCarousel.style.justifyContent = "center";
  }
}

function artistSongCurrentlyPlaying(id) {
  if (artistPlayingTrack != null) {
    artistPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
    artistPlayingTrack = null;
      // if another track is playing, hide the currently playing icon from the previous track (playlistPlayingTrack)
  }

  for (let i = 0; i < topSongsHTML.length; i++) {
      const topSongHTML = topSongsHTML[i];
      if (topSongHTML.id == id) {
        topSongHTML.html.getElementsByClassName("currently_playing_container")[0].style.display = "flex";
          artistPlayingTrack = topSongHTML;
      }
  }
}

function artistRemoveCurrentlyPlaying() {
  if (artistPlayingTrack != null) {
    artistPlayingTrack.html.getElementsByClassName("currently_playing_container")[0].style.display = "none";
    artistPlayingTrack = null;
  }
}