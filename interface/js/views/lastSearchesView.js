var lastSearches = []

function last_searches_view() {
  loadLastSearches();
}

async function loadLastSearches() {
  lastSearches = await getLastSearches();
  document.getElementById('last_searches_results_container').innerHTML = '';

  for (let index = 15; index >= 0; index--) {
    const lastSearch = lastSearches[index];
    if (lastSearch == undefined) continue;

    var lastSearchItem = document.createElement("div");
    lastSearchItem.classList.add("last_search_item");

    var lastSearchImage = document.createElement("img");
    lastSearchImage.classList.add("last_search_item_image");
    lastSearchImage.src = lastSearch.imageUrl;

    var lastSearchTextContainer = document.createElement("div");
    lastSearchTextContainer.classList.add("last_search_item_text");

    var lastSearchTitle = document.createElement("p");
    lastSearchTitle.classList.add("last_search_item_text_title");
    lastSearchTitle.innerHTML = lastSearch.name;

    var lastSearchTypeHTML = document.createElement("p");
    lastSearchTypeHTML.classList.add("last_search_item_text_type");
    lastSearchTypeHTML.innerHTML = lastSearch.type;

    lastSearchTextContainer.appendChild(lastSearchTitle);
    lastSearchTextContainer.appendChild(lastSearchTypeHTML);

    lastSearchItem.appendChild(lastSearchImage);
    lastSearchItem.appendChild(lastSearchTextContainer);

    lastSearchItem.addEventListener("click", function () {
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

    document.getElementById('last_searches_results_container').appendChild(lastSearchItem);

  }

}