var scrolledDown = false;
var scrollMaxY = document.documentElement.scrollHeight - 60;
var topSongs = [];
var altTitleState = false;
var headerImageVisible = true;
var albums = [];
var singlesEps = [];
var linkedArtists = [];
var additionalSongInfo;

function artist_view() {
}

function scrollArtistView(scrollY) {
  //console.log(scrollY);

  if (scrollY > 72 && !altTitleState) {
    toggleVisibility("av_artist_header_text", false);
    toggleVisibility("av_artist_header_gradient", false);
    console.log("in");
    document.getElementById("top_container_alternativeTitle").style.animation =
      "alternativeTitleIn 0.25s forwards";
    altTitleState = true;
  } else if (scrollY <= 72 && altTitleState) {
    toggleVisibility("av_artist_header_text", true);
    toggleVisibility("av_artist_header_gradient", true);
    console.log("out");
    document.getElementById("top_container_alternativeTitle").style.animation =
      "alternativeTitleOut 0.25s forwards";
    altTitleState = false;
  }

  let mainContainerOffsetTop = window.innerHeight * 0.4 + 60;

  if (scrollY > mainContainerOffsetTop && headerImageVisible) {
    document.getElementById("av_header_image").style.opacity = '0'
    headerImageVisible = false;
  } else if (headerImageVisible == false && scrollY <= mainContainerOffsetTop) {
    document.getElementById("av_header_image").style.opacity = '1'
    headerImageVisible = true;
  }

  if (scrollY != 0 && scrolledDown == false) {
    scrolledDown = true;
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
  try {
    bgImage = content["visuals"]["headerImage"]["sources"]["0"]["url"];
  } catch (error) {
    bgImage = "standardImages/bgArtist.jpg";
  }
  alternativeTitleElem = document.getElementById(
    "top_container_alternativeTitle"
  );

  console.log(content);

  console.log(artistName);
  console.log(bgImage);

  document.getElementById("av_artist_header_text").innerHTML = artistName;
  alternativeTitleElem.innerHTML = artistName;

  widthText = alternativeTitleElem.offsetWidth; //title top width
  marginLeft = "-" + widthText + "px";
  alternativeTitleElem.style.marginLeft = marginLeft;

  document.documentElement.style.setProperty(
    "--alternativeTitleMarginLeft",
    marginLeft
  );

  bgImageElem = document.getElementById("av_header_image");
  await loadImage(bgImage, bgImageElem);
  colorString = await getColors("av_header_image");

  document.getElementById("av_backgroundImage").src = bgImage;

  document.documentElement.style.setProperty("--accentColor", colorString);

  setMusicPreviewContent(content.discography);

  setArtistAlbumContent(content.discography)

  setArtistSinglesEpContent(content.discography)

  setArtistBiography(content);
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
  releaseCenterContainer.id = 'av_music_preview_newRelease_content_container';

  let releaseContainer = document.createElement("div");
  releaseContainer.id = "av_music_preview_newRelease_content";

  let releaseImage = document.createElement("img");
  releaseImage.classList.add("av_music_cover_big");
  releaseImage.id = "av_music_preview_newRelease_poster";
  releaseImage.src = content.coverArt.sources[2].url;

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

  releaseContainer.appendChild(releaseImage);
  releaseContainer.appendChild(releaseTextContainer);

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

      console.log(trackContent);

      let thisTrackContainer = document.createElement("div");
      thisTrackContainer.classList.add("av_music_preview_musicShowcase_track");

      let trackImage = document.createElement("img");
      trackImage.classList.add("av_music_preview_musicShowcase_trackIMG");

      let imageUrl = trackContent.album.coverArt.sources[2].url;

      if (imageUrl == undefined) {
        imageUrl = "standardImages/cover.jpg";
      }

      trackImage.src = trackContent.album.coverArt.sources[2].url;
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
        playArtistTopTrack(trackContent, j);
      });

      trackTextContainer.appendChild(trackTitle);
      trackTextContainer.appendChild(trackDurationText);

      thisTrackContainer.appendChild(trackImage);
      thisTrackContainer.appendChild(trackTextContainer);

      tracksContainer.appendChild(thisTrackContainer);

      currentTrack++;
    }

    trackContainer.appendChild(tracksContainer);
  }

  container.appendChild(heading);
  container.appendChild(trackContainer);

  document.getElementById("av_music_preview_container").appendChild(container);
}

function setArtistAlbumContent(content) {
    albums = [];
    let albumCarousel = document.getElementById("av_albums_carousel");
    albumCarousel.innerHTML = "";

    if (content.albums == undefined || content.albums.items.length == 0) {
        console.log("No albums found");
        document.getElementById("av_albums_container").style.display = "none";
        return;
    } else {
        console.log("Albums found");
        document.getElementById("av_albums_container").style.display = "flex";
    }
    
    let albumContent = content.albums.items 


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

      let albumCoverImage = document.createElement("img");
      albumCoverImage.classList.add("av_album_cover_image");
      albumCoverImage.src = getAlbumImageCoverUrl(content);

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
        openArtistAlbum(i);
      });


      albumBackground.appendChild(albumCoverImage);
      albumBackground.appendChild(albumHeading);
      albumBackground.appendChild(albumInfo);

      albumContainer.appendChild(albumBackground);

      albumCarousel.appendChild(albumContainer);
    }

}

function setArtistSinglesEpContent(content) {
  singlesEps = [];
  let singlesEpCarousel = document.getElementById("av_singles_EPs_carousel");
  singlesEpCarousel.innerHTML = "";

  console.log(content);


  let singlesContainer = content.singles.items;

  if (singlesContainer.length == 0) {
    document.getElementById("av_singles_EPs_container").style.display = "none";
    return;
  } else {
    document.getElementById("av_singles_EPs_container").style.display = "flex";
  }

  for (let i = 0; i < singlesContainer.length; i++) {
    const track = singlesContainer[i];
    let info = track.releases.items[0];
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
  

  let albumContainer = document.createElement("div");
  albumContainer.classList.add("av_album_container");

  let albumBackground = document.createElement("div");
  albumBackground.classList.add("av_album_background");

  let albumCoverImage = document.createElement("img");
  albumCoverImage.classList.add("av_album_cover_image");
  albumCoverImage.src = getAlbumImageCoverUrl(info);

  let albumHeading = document.createElement("p");
  albumHeading.classList.add("av_album_heading");

  albumName = info.name;

  if (albumName.length > 15) {
    albumName = albumName.substring(0, 15) + "...";
  }

  albumHeading.innerHTML = albumName;

  let albumInfo = document.createElement("p");
  albumInfo.classList.add("av_album_info");
  albumInfo.innerHTML = info.date.year + " - " + info.type;

  albumBackground.addEventListener("click", function () {
    openArtistSingleEp(i);
  });


  albumBackground.appendChild(albumCoverImage);
  albumBackground.appendChild(albumHeading);
  albumBackground.appendChild(albumInfo);

  albumContainer.appendChild(albumBackground);

  singlesEpCarousel.appendChild(albumContainer);
    
  }
}

function setArtistBiography(content) {
  text = content.profile.biography.text;

  if (text == undefined || text == "") {
    text = "No biography found";
  }
    
  let biographyTextContainer = document.getElementById("av_bio_description_text_container");
  biographyTextContainer.innerHTML = replaceText(text);

  console.log(content.visuals.gallery);

  if (content.visuals.gallery.items.length > 0) {
    document.getElementById("av_bio_gallery").style.display = "flex";
    document.getElementById("av_bio_description").style.width = "60%";
    let image = document.getElementById("av_bio_gallery_image");
    let bgImage = document.getElementById("av_bio_background_Image");
    imageUrl = content.visuals.gallery.items[0].sources[0].url;

    image.src = imageUrl;
    bgImage.src = imageUrl;

  } else {
    document.getElementById("av_bio_gallery").style.display = "none";
    document.getElementById("av_bio_description").style.width = "100%";

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
  let spotifyURI = str.substring(firstQuotationMark, secondQuotationMark).split(":")[2];

  let firstOcurrence = str.indexOf('>') + 1;
  let info = str.substring(firstOcurrence, str.length);

  console.log(str);

  if (!str.includes('artist')) {
    return info
  }

  let replacementTag = `<div class="av_bio_button" onclick="openArtist('${spotifyURI}')">${info}</div>`;
  linkedArtists.push({id : spotifyURI, name : info});

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
  playNewSong(content);
}

function openArtistAlbum(id) {
  console.log(albums);
  info = albums[id]
  console.log(info);
  uri = info.uri;
  id = uri.split(":")[2];
  setupAlbumView(id, info);
} 

function openArtistSingleEp(id) {
  console.log(singlesEps);
  info = singlesEps[id]
  console.log(info);
  uri = info.uri;
  id = uri.split(":")[2];
  setupAlbumView(id, info);
} 