var tracks = []
var playlistName = ""
var playlistId = 0;
var playlistEdit = false;
let id;

function playlist_view() {

}

function setContentPlaylist(playlistData, songData, thisid) {
    clearPlaylistView();
    setHeaderContentPlaylist(playlistData);
    if (songData.length > 0) {
        setSongsContentPlaylist(songData)
        tracks = songData;
    }
    id = thisid;
}

function setHeaderContentPlaylist(playlistData) {
    title = document.getElementById("playlist_header_text");
    namePlaylist = playlistData.name;
    playlistId = playlistData.id;
    if (namePlaylist == "") {
        namePlaylist = "Playlist" + playlistData.id;
    }
    playlistName = namePlaylist;
    title.innerHTML = namePlaylist;
}

async function setHeaderImage(url) {
    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = url;
    bgImage.src = url;

    colorString = await getColors("playlist_header_image")
    document.documentElement.style.setProperty("--accentColor", colorString)
    changePlaylistImage(id, url);
}

function clearPlaylistView() {
    playlistContainer = document.getElementById("playlist_tracks_container");
    playlistContainer.innerHTML = "";

    image = document.getElementById("playlist_header_image");
    bgImage = document.getElementById("playlist_image_background");
    image.src = "standardImages/cover.jpg";
    bgImage.src = "standardImages/cover.jpg";
}

function setSongsContentPlaylist(songData) {
    playlistContainer = document.getElementById("playlist_tracks_container");
    playlistContainer.innerHTML = "";

    for (let index = 0; index < songData.length; index++) {
        const song = songData[index];
        const songInfo = JSON.parse(song.info);
        title = songInfo.songTitle;
        imageUrl = songInfo.songImageUrl;
        duration = playlistTimeConvert(songInfo.songDuration);
        artistsText = getArtistString(JSON.parse(songInfo.songArtistArray)["items"])

        console.log(song);

        if (index == 0) {
            setHeaderImage(imageUrl);
        }

        console.log(song.duration);

        songContainer = document.createElement("div");
        songContainer.classList.add("playlist_track_item");

        numberContainer = document.createElement("div");
        numberContainer.classList.add("playlist_track_number_container");

        number = document.createElement("p");
        number.classList.add("playlist_track_number");
        number.innerHTML = index + 1;

        image = document.createElement("img");
        image.classList.add("playlist_track_image");
        image.src = imageUrl;

        songTitle = document.createElement("p");
        songTitle.classList.add("playlist_track_name");
        songTitle.innerHTML = title;

        artists = document.createElement("p");
        artists.classList.add("playlist_track_artists");
        artists.innerHTML = artistsText;

        durationHTML = document.createElement("p");
        durationHTML.classList.add("playlists_track_duration");
        durationHTML.innerHTML = duration;

        numberContainer.appendChild(number);

        songContainer.appendChild(numberContainer);
        songContainer.appendChild(image);
        songContainer.appendChild(songTitle);
        songContainer.appendChild(artists);
        songContainer.appendChild(durationHTML);

        songContainer.addEventListener("click", function() {
            if (!playlistEdit) {
                playTrackPlaylist(index);
            }
        })
        songContainer.addEventListener("mousedown", function(e) {
            if (playlistEdit) {
                playlistMoveStart(index, e);
            }
        })
        playlistContainer.appendChild(songContainer);

    }
}

function playTrackPlaylist(id) {
    clearQueue();
    songInfo = tracks[id];
    console.log(songInfo);
    playSongWithoutCover(songInfo)
}

async function playPlaylist() {
    clearQueue()
    for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        song = await new Song(track);
        addToQueue(song);
    }
    playQueue();
}

async function shufflePlaylist() {
    clearQueue()
    var shuffledArray = [...tracks]
    shuffleArray(shuffledArray)
    for (let index = 0; index < shuffledArray.length; index++) {
        const thisTrack = shuffledArray[index]
        song = await new Song(thisTrack);
        addToQueue(song);
    }
    playQueue();
}

function playlistNameChange() {
    let playlistNewName = document.getElementById("playlist_header_text").innerHTML;
    if (playlistNewName != playlistName) {
        changePlaylistName(playlistId, playlistNewName);
    }
}

function togglePlaylistEdit() {
    let editModeIndicator = document.getElementById("playlist_editMode_indicator");

    if (playlistEdit) {
        editModeIndicator.style.animation = "editModeOff 0.3s forwards";
        playlistEdit = false;
    } else {
        editModeIndicator.style.animation = "editModeOn 0.3s forwards";
        playlistEdit = true;
    }
}

function playlistTimeConvert(ms) {
    const seconds = Math.floor(ms / 1000);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// swap animation ------------------

let startY = 0
let startOffset = 0
let positions = []
let movingElementIndex;
let targetHeight;

function playlistMoveStart(index, e) {
    savePlaylistPositions();
    const children = document.getElementById('playlist_tracks_container').children;
    const targetDiv = children.item(index);

    //fixate element under target so it doesn't move
    if (children.length > index + 1) {
        const nextDiv = children.item(index + 1);
        nextDiv.style.marginTop = "calc(6vh + 16px)";
        
    }

    targetDiv.id = 'playlistMove'
    movingElementIndex = index;
    
    e = e || window.event
    e.preventDefault()
    startY = e.clientY
    startOffset = targetDiv.offsetTop

    targetDiv.style.position = 'absolute'
    targetDiv.style.zIndex = '1'
    targetDiv.style.top = startOffset + "px"

    document.onmousemove = playlistMove
    document.onmouseup = playlistMoveEnd

    //spawnDropTargets(index)


    console.log(positions);
    
}

function playlistMove(e) {
    e = e || window.event
    e.preventDefault()
    let targetDiv = document.getElementById('playlistMove')
    let cursorY = e.clientY
    offsetY = startY - cursorY

    targetDiv.style.top = (startOffset - offsetY) + "px";

    isOver(targetDiv.offsetTop, targetDiv.offsetHeight);
    //console.log(cursorY);
}

function playlistMoveEnd(e) {
    e = e || window.event
    e.preventDefault()

    let targetDiv = document.getElementById('playlistMove')

    document.onmousemove = null
    document.onmouseup = null
    targetDiv.id = ''
}

function savePlaylistPositions() {
    let children = document.getElementById('playlist_tracks_container').children;
    for (let index = 0; index < children.length; index++) {
        const element = children[index];

        const position = {
            currentPosition: index,
            from: element.offsetTop,
            to: element.offsetTop + element.offsetHeight
        }

        positions.push(position);

    }
    //changePlaylistPositions(playlistId, newPositions);
}

function isOver(targetOffsetTop, targetHeight) {
    biggestOverlap = 0;
    biggestOverlapIndex = -1;

    for (let i = 0; i < positions.length; i++) {
        const playlistElement = positions[i];

        if (playlistElement.from > targetOffsetTop + targetHeight || playlistElement.to < targetOffsetTop) {
            continue;
        }

        let overlap = 0

        if (targetOffsetTop < playlistElement.from) {
            overlap = Math.abs(targetOffsetTop + targetHeight - playlistElement.from);
        } else {
            overlap = Math.abs(playlistElement.to - targetOffsetTop);
        }

        if (overlap > biggestOverlap) {
            biggestOverlap = overlap;
            biggestOverlapIndex = i;
        }
    }
    console.log(biggestOverlapIndex);
}

function changePosition(playlistEntry, index, directionTarget) {
    const entryHeight = playlistEntry.offsetHeight;

    switch (directionTarget) {
        case up:
            
            break;
        case up:
        
        break;
        default:
            break;
    }



}

