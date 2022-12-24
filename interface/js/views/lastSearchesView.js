var lastSearches = []

function last_searches_view() {
  loadLastSearches();
  stopMenuLogoColorChange(false);
}

async function loadLastSearches() {
  lastSearches = await getLastSearches();
  document.getElementById('last_searches_results_container').innerHTML = '';

  for (let index = 15; index >= 0; index--) {
    const lastSearch = lastSearches[index];
    if (lastSearch == undefined) continue;
    const lastSearchId = lastSearch.spotifyId;

    var lastSearchItem = document.createElement("div");
    lastSearchItem.classList.add("last_search_item");

    var lastSearchItemClickZone = document.createElement("div");
    lastSearchItemClickZone.classList.add("last_search_item_click_zone");

    var lastSearchImage = document.createElement("img");
    lastSearchImage.classList.add("last_search_item_image");
    lastSearchImage.src = lastSearch.imageUrl;

    var lastSearchTextContainer = document.createElement("div");
    lastSearchTextContainer.classList.add("last_search_item_text");

    var lastSearchTitle = document.createElement("p");
    lastSearchTitle.classList.add("last_search_item_text_title");
    name = shortenString(lastSearch.name, 25);
    lastSearchTitle.innerHTML = name;

    var lastSearchTypeHTML = document.createElement("p");
    lastSearchTypeHTML.classList.add("last_search_item_text_type");
    lastSearchTypeHTML.innerHTML = lastSearch.type;

    var lastSearchCloseButton = document.createElement("img");
    lastSearchCloseButton.classList.add("last_search_item_close_button");
    lastSearchCloseButton.src = "icons/close.svg";

    lastSearchTextContainer.appendChild(lastSearchTitle);
    lastSearchTextContainer.appendChild(lastSearchTypeHTML);

    lastSearchItemClickZone.appendChild(lastSearchImage);
    lastSearchItemClickZone.appendChild(lastSearchTextContainer);

    lastSearchItem.appendChild(lastSearchItemClickZone);
    lastSearchItem.appendChild(lastSearchCloseButton);

    lastSearchItemClickZone.addEventListener("click", function () {
        switch (lastSearch.type) {
          case "artist":
            openArtist(lastSearch.spotifyId);
            break;
          case "album":
            console.log(lastSearch);

            var additionalInfo = JSON.parse(lastSearch.additionalInfo);
            setupAlbumView(lastSearch.spotifyId, additionalInfo);
            break;
          default:
            break;
        }
    });

    lastSearchCloseButton.addEventListener("click", function () {
        removeLastSearch(lastSearchId, index);
    });

    document.getElementById('last_searches_results_container').appendChild(lastSearchItem);
  }

}

function removeLastSearch(id, index) {
  //remove from html
  const lastSearchItems = document.getElementById('last_searches_results_container').childNodes;
  const newIndex = lastSearchItems.length - index - 1;
  const elemToBeRemoved = lastSearchItems[newIndex];

  elemToBeRemoved.parentNode.removeChild(elemToBeRemoved)

  //remove from db
  deleteSpecificLastSearch(id);
}

function shortenString(string, length) {
  if (string.length > length) {
    return string.substring(0, length) + "...";
  } else {
    return string;
  }
}