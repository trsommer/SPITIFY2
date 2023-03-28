searchSize = 0
lastSearchResult = ''
lastSearch = ""

function onLoad() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementsByTagName("body")[0].classList.add("flatTop")
    loadLastSearches()
    loadDownloads()

    window.electronAPI.updateDownloads((event, progress, spotifyId) => {
        updateDownloadProgress(spotifyId, progress)
    });

    setupMenuMove()
    attachVolumeResetListener()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function setDisplayMode(element, mode, delay){
    if(mode == 0){
        await sleep(delay);
        element.style.display = "none"
    }

    if(mode == 1){
        await sleep(delay);
        element.style.display = "block"
    }
}

async function mainSearch(query) {
    console.log("searching for:" + query + ".");
    query = query.trim()
    if (query == "") {
        changeSearchClearVisibility(false)
        switchView("last_searches_view")
        return
    }
    changeSearchClearVisibility(true)
    switchView("search_view")

    if (query == lastSearch) return

    lastSearch = query

    getSpotifySearchResults(query)
}

function clearSearchText() {
    document.getElementById("top_search_input").value = ""
    mainSearch("")
}

async function toggleSearchView(query) {
    query = query.trim()
    if (query == "") {
        switchView("last_searches_view")
    } else{
        switchView("search_view")
    }
}

function timeConvert(ms) {
    var seconds = Math.floor(ms/1000)

    //seconds to minutes
    var minutes = Math.floor(seconds/60)
    var remainingSeconds = seconds % 60

    var remainingSecondsString = "" + remainingSeconds

    if (remainingSeconds.toString().length == 1) {
        remainingSecondsString = "0" + remainingSeconds
    }

    return "" + minutes + ":" + remainingSecondsString
}

async function detHiddenItems(heading) {
    document.getElementById("menu_top_heading").innerHTML = heading
    var width = parseFloat(window.getComputedStyle(document.getElementById("menu_top_heading")).width);
    intWidth = Math.floor(width)
    document.getElementById("menu_top_hidden_heading").style.width = intWidth + "px"

    document.getElementById("menu_top_heading").style.transform = "translateX(-20px)"

    document.getElementById("menu_top_button_play").style.transform = "translateX(-20px)"

    document.getElementById("menu_top_button_follow").style.transform = "translateX(-20px)"
} 

function changeHiddenHeadingVisibility(mode, id) {
    if (!mode) {
        document.getElementById(id).style.transform = "translateX(-20px)"
        document.getElementById(id).style.opacity = 0
        document.getElementById(id).style.pointerEvents = "none"
    } else {
        document.getElementById(id).style.transform = "translateX(0px)"
        document.getElementById(id).style.opacity = 1
        document.getElementById(id).style.pointerEvents = null
    }
}

function changeSearchClearVisibility(mode) {
    if (!mode) {
        document.getElementById("top_search_clear_container").style.opacity = 0
    } else {
        document.getElementById("top_search_clear_container").style.opacity = 1
    }
}

function removeClass(id, className) {
    document.getElementById(id).classList.remove(className)
}

function addClass(id, className) {
    document.getElementById(id).classList.add(className)
}

function stopMenuLogoColorChange(mode) {
    if (mode && !menuLogoColorChangeStopped) {
      menuLogoColorChangeStopped = true;
      removeClass('menu_top_logo', 'menu_top_logo')
      removeClass('menu_top_text', 'menu_top_text')
    }
    if (!mode && menuLogoColorChangeStopped) {
      menuLogoColorChangeStopped = false;
      addClass('menu_top_logo', 'menu_top_logo')
      addClass('menu_top_text', 'menu_top_text')
    }
  }

  function changeMenuTopVisibility(mode) {
    if (!mode) {
        stopMenuLogoColorChange(false)
        setTopMenuOpacity(0.95);
        changeHiddenHeadingVisibility(true, "menu_top_heading");
        changeHiddenHeadingVisibility(true, "menu_top_button_play");
        changeHiddenHeadingVisibility(true, "menu_top_button_follow");
    } else {
        stopMenuLogoColorChange(true)
        setTopMenuOpacity(0);
        changeHiddenHeadingVisibility(false, "menu_top_heading");
        changeHiddenHeadingVisibility(false, "menu_top_button_play");
        changeHiddenHeadingVisibility(false, "menu_top_button_follow");
    }
  }