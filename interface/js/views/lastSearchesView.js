var lastSearches = []

function last_searches_view() {
  loadLastSearches();
  stopMenuLogoColorChange(false);
  updateTopBarVisible(true);
}

async function loadLastSearches() {
  lastSearches = await getLastSearches();
  document.getElementById('last_searches_results_container').innerHTML = '';
  let newIndex = 0;

  for (let index = lastSearches.length - 1; index >= 0; index--) {
    const lastSearch = lastSearches[index];
    if (lastSearch == undefined) continue;
    const lastSearchId = lastSearch.spotifyId;

    const lastSearchItem = document.createElement("div");
    lastSearchItem.classList.add("last_search_item");

    const lastSearchItemClickZone = document.createElement("div");
    lastSearchItemClickZone.classList.add("last_search_item_click_zone");

    const lastSearchImage = document.createElement("img");
    lastSearchImage.classList.add("last_search_item_image");
    lastSearchImage.src = lastSearch.imageUrl;

    const lastSearchTextContainer = document.createElement("div");
    lastSearchTextContainer.classList.add("last_search_item_text");

    const lastSearchTitle = document.createElement("p");
    lastSearchTitle.classList.add("last_search_item_text_title");
    name = shortenString(lastSearch.name, 25);
    lastSearchTitle.innerHTML = name;

    const lastSearchTypeHTML = document.createElement("p");
    lastSearchTypeHTML.classList.add("last_search_item_text_type");
    lastSearchTypeHTML.innerHTML = lastSearch.type;

    const lastSearchCloseButton = document.createElement("img");
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
    const theIndex = newIndex;
    lastSearchCloseButton.addEventListener("click", function () {
        removeLastSearch(lastSearchId, lastSearchItem);
    });

    document.getElementById('last_searches_results_container').appendChild(lastSearchItem);

    newIndex++;
  }

}

function removeLastSearch(id, element) {
  //remove from html
  const lastSearchesContainer = document.getElementById('last_searches_results_container');
  lastSearchesContainer.removeChild(element)

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