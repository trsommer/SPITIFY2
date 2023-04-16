
function viewFactory(viewType) {
    switch (viewType) {
        case "artist": return new ArtistView();
        case "album": return new AlbumView();
        case "playlist": return new PlaylistView();
        case "playlists": return new PlaylistsView();
        case "search": return new SearchView();
        case "searchList": return new SearchListView();
        case "download": return new DownloadView();
        case "settings": return new SettingsView();
        case "lastSearches": return new LastSearchesView();
        default: throw new Error("Invalid view type");
    }
}
