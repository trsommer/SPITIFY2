searchSize = 0
lastSearchResult = ''
lastSearch = ""

function onLoad() {
    placeSettingsMenuItem()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.getElementsByTagName("body")[0].classList.add("flatTop")
    loadLastSearches()
}



function menuAnimation(i) {
    var menuLeft = document.getElementById("menu_left")
    var menuTop = document.getElementById("menu_top")
    var menuTopText = document.getElementById("logo_top_text")
    var menuTopIcon = document.getElementById("logo_top_icon")
    var menuText = document.querySelectorAll(".menu_topMenu_item_text")
    var topContainer = document.getElementById("top_container")
    var playerContainer = document.getElementById("menu_player_container")
    var menuPlayer = document.getElementById("menu_player")
    //var playerState = getPlayerState()
    setPlayerPosition()

    if(i == 0) {
        menuLeft.style.animation = "menuAnimationIn 0.25s forwards"
        menuTopText.style.animation = "logoTopIn 0.25s forwards"
        menuTop.style.animation = "menuTopIn 0.25s forwards"
        menuTopIcon.style.animation = "logoTopColorChangeIn 0.25s forwards"
        topContainer.style.animation = "searchBoxIn 0.25s forwards"
        menuSlidePlayer("In")
        addAnimations("menuTopTextIn 0.25s forwards", menuText, 0, 1)
    }

    if(i == 1) {
        menuLeft.style.animation = "menuAnimationOut 0.25s forwards"
        menuTopText.style.animation = "logoTopOut 0.25s forwards"
        menuTop.style.animation = "menuTopOut 0.25s forwards"
        menuTopIcon.style.animation = "logoTopColorChangeOut 0.25s forwards"
        topContainer.style.animation = "searchBoxOut 0.25s forwards"
        menuSlidePlayer("Out")
        addAnimations("menuTopTextOut 0.25s forwards", menuText, 0, 0)
    }

}

async function addAnimations(animation, elements, delay, mode) {
    for (i = 0; i < elements.length; i++) {
        element = elements[i]

        element.style.animation = animation
        await sleep(delay)
        //await setDisplayMode(element, mode, delay)
    }
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

function placeSettingsMenuItem() {
    var menuLeft = document.getElementById("menu_left")
    var menuTop = document.getElementById("menu_topMenu")
    var menuItem = document.getElementById("menu_settings_button")

    var marginTop = menuLeft.clientHeight - menuTop.clientHeight - menuItem.clientHeight - 60
    menuItem.style.marginTop = "" + marginTop + "px"

    console.log(marginTop);

}

window.addEventListener('resize', function(event){
    placeSettingsMenuItem()
    scrollMaxY = document.documentElement.scrollHeight - 60
});



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

    response = await getSpotifySearchResults(query)

    setContentSearch(response)

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

