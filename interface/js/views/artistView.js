var scrolledDown = false
var scrollMaxY = document.documentElement.scrollHeight - 60
var topSongs = []

function scrollArtistView(scrollY) {
    if (scrollY > 72){
        toggleVisibility('av_artist_header_text', false)
        toggleVisibility('av_artist_header_gradient', false)

        document.getElementById("top_container_alternativeTitle").style.animation = "alternativeTitleIn 0.25s forwards"


    } else {
        toggleVisibility('av_artist_header_text', true)
        toggleVisibility('av_artist_header_gradient', true)

        document.getElementById("top_container_alternativeTitle").style.animation = "alternativeTitleOut 0.25s forwards"
    }


    if (scrollY <= scrollMaxY) {
        expandBG(scrollY, scrollMaxY)
    }

    if (scrollY != 0 && scrolledDown == false) {
        scrolledDown = true

    }
}

function toggleVisibility(id, bool) {
    var element = document.getElementById(id)

    if(bool == false) {
        element.style.display = 'none'
    } else {
        element.style.display = 'block'
    }
}



function expandBG(size, maxYScroll) {
    var percentValue = size / maxYScroll

    bg_container = document.getElementById("av_header_container")
    bg_gradient = document.getElementById("av_artist_header_gradient")


    newHeight = 50 + 50 * percentValue

    bg_container.style.height = "" + newHeight + "vh"
    bg_gradient.style.opacity = 1 - percentValue
}

async function loadImage(url, elem) {
    return new Promise((resolve, reject) => {
      elem.onload = () => resolve(elem);
      elem.onerror = reject;
      elem.src = url;
    });
  }

async function setContent(content) {
    artistName = content["profile"]["name"]
    try {
        bgImage = content["visuals"]["headerImage"]["sources"]["0"]["url"]
    } catch (error) {
        bgImage = "standardImages/bgArtist.jpg"
    }
    alternativeTitleElem = document.getElementById("top_container_alternativeTitle")

    console.log(content)

    console.log(artistName)
    console.log(bgImage)

    document.getElementById("av_artist_header_text").innerHTML = artistName
    alternativeTitleElem.innerHTML = artistName

    widthText = alternativeTitleElem.offsetWidth //title top width
    marginLeft = "-" + widthText + "px"
    alternativeTitleElem.style.marginLeft = marginLeft

    document.documentElement.style.setProperty("--alternativeTitleMarginLeft", marginLeft)

    bgImageElem = document.getElementById("av_bg_image")
    await loadImage(bgImage, bgImageElem);
    colorString = await getColors("av_bg_image")

    document.documentElement.style.setProperty("--accentColor", colorString)

    setMusicPreviewContent(content["discography"])
}

function setMusicPreviewContent(content) {
    latestRelease = content["latest"]
    topSongs = content["topTracks"]["items"]

    setNewReleaseContent(latestRelease)
    x = 6

    if (topSongs.length < 6) {
        x = topSongs.length
    }

    for (var i = 0; i < 6; i++) {
        if (i < x) {
            info = topSongs[i]
            setPlaceHolderVisibility(i, true)
            setPopularSong(info, i)
        } else {
            setPlaceHolderVisibility(i, false)
        }
    }
}

function setNewReleaseContent(content) {

    try {
        document.getElementById("av_music_preview_newRelease").style.display = "flex"
        document.getElementById("av_music_preview_musicShowcase").style.width = "50%"
        document.getElementById("av_music_preview_newRelease_poster").src = content["coverArt"]["sources"]["2"]["url"]
        document.getElementById("av_music_preview_newRelease_name").innerHTML = content["name"]
        document.getElementById("av_music_preview_newRelease_nrSongs").innerHTML = content["tracks"]["totalCount"] + " Songs"
        document.getElementById("av_music_preview_newRelease_date").innerHTML = content["date"]["year"]
    } catch (error) {
        document.getElementById("av_music_preview_newRelease").style.display = "none"
        document.getElementById("av_music_preview_musicShowcase").style.width = "100%"
    }

}

function setPopularSong(content, index) {    
    info = content["track"]

    duration = parseInt(info["duration"]["totalMilliseconds"])

    time = timeConvert(duration)

    document.getElementById("av_music_preview_musicShowcase_poster_" + index).src = info["album"]["coverArt"]["sources"]["0"]["url"]
    document.getElementById("av_music_preview_musicShowcase_"+ index +"_text1").innerHTML = info["name"]
    document.getElementById("av_music_preview_musicShowcase_"+ index +"_text2").innerHTML = time
}

function setPlaceHolderVisibility(index, visibility) {
    placeholder = document.getElementById("av_music_preview_musicShowcase_container_" + index)

    if (visibility) placeholder.style.display = "flex"
    else placeholder.style.display = "none"
}

function playTopSong(id) {
    console.log("playTopSong" + id)
    console.log(topSongs);
    playSong(topSongs[id]["track"])
}