var contextMenuShown = false
var contextSubMenuShown = false
var clickedSongInfo = []

window.addEventListener('click', (e) => {
    if (contextMenuShown) {
        contextMenuShown = false
        console.log('clicked')
        document.getElementById("context_menu_container").innerHTML = "";
        contextSubMenuShown = false
    }
})

function setClickedSong(info) {
    clickedSongInfo = info
}


function spawnContextMenu(cursorX, cursorY, content) {
    document.getElementById("context_menu_container").innerHTML = "";
    var menu = document.createElement('div')
    menu.classList.add('context_menu')
    menu.id = 'context_main_menu'
    menu.style.display = "block";
    var menuWidth = 150
    var windowWidth = window.innerWidth
    var menuHeight = 250
    var windowHeight = window.innerHeight

    var offsetLeft;
    var offsetTop;

    if (menuWidth + cursorX + 50 > windowWidth) {
        offsetLeft = cursorX - menuWidth;
    } else {
        offsetLeft = cursorX;
    }
    
    if (menuHeight + cursorY + 50 > windowHeight) {
        offsetTop = cursorY - menuHeight;
    } else {
        offsetTop = cursorY;
    }

    menu.style.left = offsetLeft + "px";
    menu.style.top = offsetTop + "px";

    for (let index = 0; index < content.length; index++) {
        let buttonContent = content[index]
        var subMenuButton = document.createElement('div')
        subMenuButton.classList.add('context_menu_button')
        subMenuButton.innerHTML = buttonContent.name

        if (buttonContent.subMenu != null) {
            console.log("submenu");
            subMenuButton.addEventListener('mouseover', (e) => {
                console.log("mouseover");
                buttonContent.subMenu(offsetLeft, offsetTop, index, "right")
            })
        } else {
            subMenuButton.addEventListener('mouseenter', (e) => {
                removeSubMenu()
            })
        }

        if (buttonContent.action != null) {
            subMenuButton.addEventListener('click', (e) => {
                buttonContent.action()
            })
        }

        menu.appendChild(subMenuButton)
    }


    document.getElementById("context_menu_container").appendChild(menu);
    contextMenuShown = true;
}

function spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content) {
    removeSubMenu()
    var subMenu = document.createElement('div')
    subMenu.classList.add('context_menu')
    subMenu.id = 'context_sub_menu'

    subMenu.style.display = "block";

    var calculatedOffsetTop = OffsetTop + 5 + 16 + 32 * buttonIndex; //5 for top padding, 16 for middle of button, 32 for each button

    var menuWidth = 160
    var windowWidth = window.innerWidth
    var calculatedOffsetLeft = 0;

    if (offsetLeft + menuWidth + 2 + menuWidth + 50 > windowWidth) {
        calculatedOffsetLeft = offsetLeft - menuWidth - 2;
        subMenu.style.borderRadius = "20px 0 20px 20px";
    } else {
        calculatedOffsetLeft = offsetLeft + menuWidth + 2;
        subMenu.style.borderRadius = "0 20px 20px 20px";
    }

    subMenu.style.left = calculatedOffsetLeft + "px";
    subMenu.style.top = calculatedOffsetTop + "px"; 

    console.log(content);

    for (let i = 0; i < content.length; i++) {
        var subMenuButton = document.createElement('div')
        subMenuButton.classList.add('context_menu_button')
        subMenuButton.innerHTML = content[i].name

        if (content[i].action != null) {
            subMenuButton.addEventListener('click', (e) => {
                content[i].action(i)
            })
        }

        subMenu.appendChild(subMenuButton)        
    }

    contextSubMenuShown = true;

    document.getElementById("context_menu_container").appendChild(subMenu);
}

function contextPlaylists(offsetLeft, OffsetTop, buttonIndex, side) {
    let playlists = getPlaylists()
    let content = []

    for (let i = 0; i < playlists.length; i++) {
        let playlist = playlists[i];
        let newPlaylistContent = {
            name: playlist.name,
            action: contextAddToPlaylist,
            subMenu: null
        }

        content.push(newPlaylistContent)
    }

    content.push({
        name: "new playlist",
        action: contextAddToNewPlaylist,
        subMenu: null
    })

    console.log(content);

    spawnContextSubMenu(offsetLeft, OffsetTop, buttonIndex, content)
}


function removeSubMenu() {
    var childCount = document.getElementById("context_menu_container").childElementCount;

    if (childCount > 1) {
        document.getElementById("context_menu_container").removeChild(document.getElementById("context_menu_container").lastChild);
        contextSubMenuShown = false;
    }
}

async function spawnSongMenu(e) {
    getPlaylistsFromDB()
    let cursorX = e.clientX
    let cursorY = e.clientY
    let content = [
    {name: "play", action: contextPlay, subMenu: null},
    {name: "play next", action: contextPlayNext, subMenu: null},
    {name: "play after queue", action: contextPlayAfterQueue, subMenu: null},
    {name: "add to playlist", action: null, subMenu: contextPlaylists},
    {name: "open Artist", action: null, subMenu: null},
    {name: "download", action: contextDownload, subMenu: null}
    ]

    spawnContextMenu(cursorX, cursorY, content)
}

function contextPlay() {
    playSongWithoutCover(clickedSongInfo)
}

function contextPlayNext() {
    console.log("play next");
}

function contextPlayAfterQueue() {
    console.log("play after queue");
}

async function contextLike() {
    let song = await new Song(clickedSongInfo)
    song.likeSong()
}

function contextDislike() {
}

function contextDownload() {
    console.log("download");
}

async function contextAddToPlaylist(index) {
    let song = await new Song(clickedSongInfo)
    addPlaylistSong(clickedSongInfo.id, index + 1)
}

function contextAddToNewPlaylist() {
    createPlaylist()
}