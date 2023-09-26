var currentView = "last_searches_view"
var openedFrom = ""
var lastViewInfo = ""
var backButtonVisibility = false
var artistResizeListener = false
var settingsScrollListener = false
var playerTopOffset = false
const views = [
  "search_view",
  "search_list_view",
  "artist_view",
  "last_searches_view",
  "album_view",
  "playlists_view",
  "playlist_view",
  "downloads_view",
  "settings_view"
]
const sideMenuViews = ["playlists_view", "downloads_view", "settings_view"]
var scrollBarShape = 0

function switchView(view) {
  if (!views.includes(view)) {
    return
  }

  if (view == "artist_view") {
    window.addEventListener("resize", recalculateAlbumCarouselWidth)
    artistResizeListener = true
  } else {
    if (artistResizeListener) {
      window.removeEventListener("resize", recalculateAlbumCarouselWidth)
      artistResizeListener = false
    }
  }

  if (view == "settings_view") {
    window.addEventListener("scroll", scrollSettings)
    settingsScrollListener = true
  } else {
    if (settingsScrollListener) {
      window.removeEventListener("scroll", scrollSettings)
      settingsScrollListener = false
    }
  }

  document.getElementById("menu_top_hidden_heading").style.width = null
  setTopMenuOpacity(0.95)
  if (scrolledDown == true) {
    changeHiddenHeadingVisibility(false, "menu_top_heading")
    changeHiddenHeadingVisibility(false, "menu_top_button_play")
    changeHiddenHeadingVisibility(false, "menu_top_button_follow")
  }

  window.scrollTo({ top: 0, behavior: "smooth" })

  if (backButtonVisibility) {
    openedFrom = ""
    backButtonChangeVisibility(false)
  }

  if (openedFrom != "") {
    backButtonChangeVisibility(true)
  }

  found = false

  if (sideMenuViews.includes(currentView) && !sideMenuViews.includes(view)) {
    deactivateSideButton(currentView)
  }

  console.log("switched from " + currentView + " to " + view)

  //call views function to update view
  const func1 = new Function(view + "()")
  func1()

  currentView = view

  for (let index = 0; index < views.length; index++) {
    const hiddenview = views[index]
    document.getElementById(hiddenview).style.display = "none"
  }

  document.getElementById(view).style.display = "block"
}

window.addEventListener("scroll", function (event) {
  var scrollY = window.scrollY
  bg_gradient = document.getElementById("av_artist_header_gradient")
  if (currentView == "artist_view") {
    scrollArtistView(scrollY)
  }
  if (currentView == "album_view") {
    scrollAlbumView(scrollY)
  }

  var limit =
    Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ) - window.innerHeight

  if (scrollY == 0) {
    setScrollBarShape(0)
  } else if (scrollY >= limit) {
    setScrollBarShape(2)
  } else {
    setScrollBarShape(1)
  }
})

function setScrollBarShape(type) {
  body = document.getElementsByTagName("body")[0]
  switch (type) {
    case 0:
      body.setAttribute("class", "flatTop")
      break
    case 1:
      body.setAttribute("class", "roundTop")
      break
    case 2:
      body.setAttribute("class", "flatBottom")
      break
    default:
      return
  }
}

function toggleMenuView(view) {
  deactivateSideButton(currentView)
  nextView = view + "_view"
  activateSideButton(nextView)
  switchView(nextView)
}

function deactivateSideButton(view) {
  viewButtonContainer = document.getElementById("menu_item_container")
  if (sideMenuViews.includes(view)) {
    index = sideMenuViews.indexOf(view)
    //get button
    button = viewButtonContainer.children[index]
    //remove active class
    button.classList.remove("menu_button_active")
    //add inactive class
    button.classList.add("menu_button_inactive")
  }
}

function activateSideButton(view) {
  viewButtonContainer = document.getElementById("menu_item_container")
  if (sideMenuViews.includes(view)) {
    index = sideMenuViews.indexOf(view)
    //get button
    button = viewButtonContainer.children[index]
    //remove active class
    button.classList.add("menu_button_active")
    //add inactive class
    button.classList.remove("menu_button_inactive")
  }
}

function backButtonChangeVisibility(visibility) {
  if (visibility) {
    backButtonVisibility = true
    updateAlbumBackButtonVisible(true)
    document.getElementById("menu_top_back_button").style.width = "45px"
    document.getElementById("menu_top_back_button").style.opacity = "1"
  } else {
    backButtonVisibility = false
    updateAlbumBackButtonVisible(false)
    document.getElementById("menu_top_back_button").style.width = "0px"
    document.getElementById("menu_top_back_button").style.opacity = "0"
  }
}

function setOpenedFrom(from, info) {
  openedFrom = from
  lastViewInfo = info
}

function goBack() {
  document.documentElement.style.setProperty("--accentColor", lastViewInfo.accentColor)
  document.getElementById("menu_top_heading").innerHTML = lastViewInfo.title
  switchView(openedFrom)
  openedFrom = ""
  lastViewInfo = ""
}

function setTopMenuOpacity(opacity) {
  document.getElementById("menu_top").style.opacity = opacity
}

function indicateCurrentlyPlaying(id) {
  switch (currentView) {
    case "playlist_view":
      playlistSongCurrentlyPlaying(id)
      break
    case "album_view":
      albumSongCurrentlyPlaying(id)
      break
    case "downloads_view":
      downloadsSongCurrentlyPlaying(id)
      break
    case "artist_view":
      artistSongCurrentlyPlaying(id)
      break
    case "search_view":
      searchSongCurrentlyPlaying(id)
      break
    default:
      break
  }
}

function removeCurrentlyPlaying() {
  playlistRemoveCurrentlyPlaying()
  albumRemoveCurrentlyPlaying()
  downloadsRemoveCurrentlyPlaying()
  artistRemoveCurrentlyPlaying()
  searchRemoveCurrentlyPlaying()
}
