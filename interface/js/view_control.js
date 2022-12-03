var currentView = "last_searches_view";
var openedFrom = ""; 
var backButtonVisibility = false;
var views = [
  "search_view",
  "artist_view",
  "last_searches_view",
  "album_view",
  "playlists_view",
  "playlist_view",
  "downloads_view",
  "settings_view",
];
var sideMenuViews = ["playlists_view", "downloads_view", "settings_view"];
var scrollBarShape = 0;

function switchView(view) {
  if (!views.includes(view)) {
    return;
  }

  if (view != "artist_view") {
    document.getElementById("menu_top_hidden_heading").style.width = null;
    if (altTitleState == true) {
      changeHiddenHeadingVisibility(false, "menu_top_heading");
      changeHiddenHeadingVisibility(false, "menu_top_button_play");
      changeHiddenHeadingVisibility(false, "menu_top_button_shuffle");
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (backButtonVisibility) {
    openedFrom = "";
    backButtonChangeVisibility(false);
  }

  if (openedFrom != "") {
    backButtonChangeVisibility(true);
  }



  /*
  if (altTitleState) {
    document.getElementById("top_container_alternativeTitle").style.animation =
    "alternativeTitleOut 0.25s forwards";
    altTitleState = false;
  }
  */

  found = false;

  for (let index = 0; index < sideMenuViews.length; index++) {
    const v = sideMenuViews[index];
    if (v == view) {
      found = true;
      break;
    }
  }

  console.log(view);

  if (!found && view != "playlist_view") {
    //clearSideMenuActiveButtons("");
  }

  console.log("switched from " + currentView + " to " + view);

  //call views function to update view
  const func1 = new Function(view + "()");
  func1();

  currentView = view;

  for (let index = 0; index < views.length; index++) {
    const hiddenview = views[index];
    document.getElementById(hiddenview).style.display = "none";
  }

  document.getElementById(view).style.display = "block";
}

window.addEventListener("scroll", function (event) {
  var scrollY = window.scrollY;
  bg_gradient = document.getElementById("av_artist_header_gradient");
  if (currentView == "artist_view") {
    scrollArtistView(scrollY);
  }

  var limit =
    Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    ) - window.innerHeight;

  if (scrollY == 0) {
    setScrollBarShape(0);
  } else if (scrollY >= limit) {
    setScrollBarShape(2);
  } else {
    setScrollBarShape(1);
  }
});

function setScrollBarShape(type) {
  body = document.getElementsByTagName("body")[0];
  switch (type) {
    case 0:
      body.setAttribute("class", "flatTop");
      break;
    case 1:
      body.setAttribute("class", "roundTop");
      break;
    case 2:
      body.setAttribute("class", "flatBottom");
      break;
    default:
      return;
  }
}

function toggleMenuView(view) {
  currentButtonSideMenu = view;
  //clearSideMenuActiveButtons(view);
  switchView(view+"_view");
}

function clearSideMenuActiveButtons(exclude) {
  buttons = ["playlists", "downloads", "settings"];

  console.log(exclude);

  for (let index = 0; index < buttons.length; index++) {
    const button = buttons[index];

    if (button == exclude) {
      continue;
    }

    document
      .getElementById("menu_" + button + "_icon")
      .style.removeProperty("fill");
    document
      .getElementById("menu_" + button + "_text")
      .style.removeProperty("fill");
    document
      .getElementById("menu_" + button + "_button")
      .style.removeProperty("background");
  }
}

function backButtonChangeVisibility(visibility) {
  if (visibility) {
    backButtonVisibility = true;
    document.getElementById("menu_top_back_button").style.width = "45px";
    document.getElementById("menu_top_back_button").style.opacity = "1";
  } else {
    backButtonVisibility = false;
    document.getElementById("menu_top_back_button").style.width = "0px";
    document.getElementById("menu_top_back_button").style.opacity = "0";  }
}

function setOpenedFrom(from) {
  openedFrom = from;
}

function goBack() {
  switchView(openedFrom);
  openedFrom = "";
}