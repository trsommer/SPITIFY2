var currentView = "last_searches_view";
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

  if (altTitleState) {
    document.getElementById("top_container_alternativeTitle").style.animation =
    "alternativeTitleOut 0.25s forwards";
    altTitleState = false;
  }

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
    clearSideMenuActiveButtons("");
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
  document.getElementById("menu_" + view + "_icon").style.fill =
    "var(--bg_dark)";
  document.getElementById("menu_" + view + "_text").style.fill =
    "var(--bg_dark)";
  document.getElementById("menu_" + view + "_button").style.background =
    "var(--accentColor)";
  currentButtonSideMenu = view;
  clearSideMenuActiveButtons(view);
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
