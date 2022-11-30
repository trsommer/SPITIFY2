searchSize = 0
lastSearchResult = ''
lastSearch = ""

function onLoad() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementsByTagName("body")[0].classList.add("flatTop")
    loadLastSearches()

    window.electronAPI.updateDownloads((event, progress, spotifyId) => {
        console.log(spotifyId + ": " + progress);
    });
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



async function search(query) {
    console.log("searching for:" + query + ".");
    query = query.trim()
    if (query == "") {
        switchView("last_searches_view")
        return
    }
    switchView("search_view")

    if (query == lastSearch) return

    lastSearch = query

    getSpotifySearchResults(query)
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

