var currentView = "artist_view"
var views = ["search_view", "artist_view", "last_searches_view", "album_view"]
var scrollBarShape = 0


function switchView(view) {
    if (! views.includes(view)) {
        return
    }

    currentView = view

    for (let index = 0; index < views.length; index++) {
        const hiddenview = views[index];
        document.getElementById(hiddenview).style.display = "none"
    }

    document.getElementById(view).style.display = "block"

    console.log("switched to " + view)

}

window.addEventListener('scroll', function(event){
    var scrollY = window.scrollY
    bg_gradient = document.getElementById("av_artist_header_gradient")
    if (currentView == "artist_view") {
        scrollArtistView(scrollY)
    }

    if (scrollY == 0) {
        setScrollBarShape(0)
    } else {
        setScrollBarShape(1)
    }


})

function setScrollBarShape(type) {
    body = document.getElementsByTagName("body")[0]

    if(type == 0 && scrollBarShape == 1) {
        body.setAttribute( 'class', 'flatTop' );
        scrollBarShape = 0
    } 
    if (type == 1 && scrollBarShape == 0) {
        body.setAttribute( 'class', 'roundTop' );
        scrollBarShape = 1
    }
}