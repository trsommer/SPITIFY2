position = 0
mouseDown = false;
startCords = null
endCords = null
startOffset = null
newOffset = null
startDate = null
playerCurrentPosition = "bottomLeft"
currentPositionIndex = 2
topBarVisible = true
leftMenuVisible = false
disabled = false

function setupMenuMove() {
    const playerBG = document.getElementById('menu_player')
    const volumeSlider = document.getElementById('menu_player_volume_slider')
    const menuLeft = document.getElementById('menu_left')
    const menu_pushed = document.getElementById('menu_pushed')
    playerBG.addEventListener('mousedown', function(e) {
        if (e.target.nodeName == "INPUT") {
            return
        }
        startMovePlayer(e)
    }, false);

    volumeSlider.addEventListener('input', function(e) {
        volumeSlider.style.backgroundSize = volumeSlider.value + '% 100%';
    }, false)

    menuLeft.addEventListener("mouseenter", function(e) {
        updateLeftMenuVisible(true)
    }, false)

    menuLeft.addEventListener("mouseleave", function(e) {
        updateLeftMenuVisible(false)
    }, false)
}

function updateTopBarVisible (visible) {
    if (topBarVisible == visible) return

    const player = document.getElementById("menu_player_container");
    //reposition player if shown 

    player.style.transition = "0.25s ease";

    if (topBarVisible == false && visible == true) {
        //translate down 60px
        player.classList.add("topRightWithTopBar")
    } else {
        //translate up 60px
        player.style.transitionDelay = "0.25s";
        player.classList.remove("topRightWithTopBar")
    }

    player.addEventListener("transitionend", function () {
        player.style.transition = "none";
        player.style.transitionDelay = "none";
        console.log("transition ended");
      }, {once: true});
    
    topBarVisible = visible
}

function updateLeftMenuVisible (visible) {
    if (leftMenuVisible == visible) return

    if (playerCurrentPosition == "topRight" || playerCurrentPosition == "bottomRight") return

    const player = document.getElementById("menu_player_container");
    //reposition player if shown 

    player.style.transition = "0.25s ease";

    if (leftMenuVisible == false && visible == true) {
        //translate right 180px
        player.classList.add("leftWithLeftMenu")
    } else {
        //translate left 180px
        player.classList.remove("leftWithLeftMenu")
    }
    
    leftMenuVisible = visible
}

// player in animation
async function animatePlayerIn() {
    const playerBG = document.getElementById('menu_player')
    const playerCover = document.getElementById('menu_player_cover')
    const playerText = document.getElementById('menu_player_text_container')
    const sliderTime = document.getElementById('menu_player_slider')
    const sliderVolume = document.getElementById('menu_player_volume_slider')

    const buttonShuffle = document.getElementById('menu_player_shuffle')
    const buttonBack = document.getElementById('menu_player_backward')
    const buttonPlay = document.getElementById('menu_player_play')
    const buttonForward = document.getElementById('menu_player_forward')
    const buttonRepeat = document.getElementById('menu_player_repeat')
    const buttonLike = document.getElementById('menu_player_like')

    const buttonsAndSlider = [buttonShuffle, buttonBack, buttonPlay, buttonForward, buttonRepeat, sliderVolume, buttonLike]

    for (let i = 0; i < buttonsAndSlider.length; i++) {
        //add transition delay to each button
        buttonsAndSlider[i].style.transitionDelay = `${0.15 + i * 0.08}s`
        buttonsAndSlider[i].style.opacity = 1
        if (i == 5) {
            buttonsAndSlider[i].style.width = "150px"
        }

        buttonsAndSlider[i].addEventListener('transitionend', function() {
            buttonsAndSlider[i].style.transitionDelay = null
        }, {once: true})
    }

    //add class menu_player_shown to playerBG
    playerBG.classList.add('menu_player_shown')
    
    //add class menu_player_cover_shown to playerCover
    playerCover.classList.add('menu_player_cover_shown')

    //add class menu_player_text_container_shown to playerText
    playerText.classList.add('menu_player_text_container_shown')

    //add class menu_player_slider_shown to sliderTime
    sliderTime.classList.add('menu_player_slider_shown')

}

// player movement
function startMovePlayer(e) {
    if(disabled) {
        return
    }
    e = e || window.event
    e.preventDefault()
    mouseDown = true;
    player = document.getElementById('menu_player_container')
    player.classList.remove('mouseUpCursor')
    player.classList.add('mouseDownCursor')
    startCords = {
        x: e.clientX,
        y: e.clientY
    }
    startOffset = {
        x: player.offsetLeft,
        y: player.offsetTop
    }

    player.className = ""
    player.style.cssText = ""
    player.style.top = startOffset.y + "px"
    player.style.left = startOffset.x + "px"

    startDate = new Date()
    document.onmousemove = movePlayer
    document.onmouseup = endMovePlayer
}

function movePlayer(e) {
    e = e || window.event
    e.preventDefault()
    posY = e.clientY
    posX = e.clientX
    player = document.getElementById('menu_player_container')

    offsetY = startCords.y - posY
    offsetX = posX - startCords.x

    newOffset = {
        x: offsetX,
        y: offsetY
    }
    player.style.left = (startOffset.x + offsetX) + "px";
    player.style.top = (startOffset.y - offsetY) + "px";
}

function endMovePlayer(e) {
    e = e || window.event;
    e.preventDefault()
    mouseDown = false
    player = document.getElementById('menu_player_container')
    playerBg = document.getElementById('menu_player')
    startLeft = startOffset.x + "px"
    startTop="60px"

    player.addEventListener('transitionend', function() {
        setFinalPosition(playerCurrentPosition)
    }, { once: true })

    endCords = {
        x: e.clientX,
        y: e.clientY
    }

    velocity = getVelocity()
    console.log(velocity);
    if (velocity > 500) {
        const direction = getDirection(startCords, endCords)
        if(direction != "neutral") {
            offset = getOffset(direction)
            playerCurrentPosition = direction
            animationToPlayerPosition(offset)
            //add animation end listener to player
        }
    } else if (velocity < 500 && velocity > 10) {
        offset = getOffset(playerCurrentPosition)
        animationToPlayerPosition(offset)
        playerBg.classList.remove('mouseDownCursor')
        playerBg.classList.add('mouseUpCursor')
    }

    document.onmouseup = null;
    document.onmousemove = null;
}

function getVelocity() {
    endDate = new Date()
    timeDiff = getTimeDifference(startDate, endDate)
    distance = getVectorDistance(startCords, endCords)

    return (distance / timeDiff)
}

function getTimeDifference(startDate, endDate) {
    timeDiff = (endDate.getTime() - startDate.getTime()) / 1000
    return timeDiff
}

function getVectorDistance(start, end) {
    vectorX = end.x - start.x
    vectorY = end.y - start.y

    return Math.sqrt(vectorX * vectorX + vectorY * vectorY)
}

function setFinalPosition(direction) {
    player = document.getElementById('menu_player_container')
    console.log("end");
    //remove transitions from player
    player.style.cssText = null

    switch (direction) {
        case "topLeft":
            //set player class to top left
            player.className = "topLeft"
            break;
        case "topRight":
            player.className = "topRight"
            if (topBarVisible) player.classList.add("topRightWithTopBar")
            break;
        case "bottomLeft":
            player.className = "bottomLeft"
            break;
        case "bottomRight":
            player.className = "bottomRight"
            break;
        
        default:
            break;
    }
}

function animationToPlayerPosition(newOffset) {
    player = document.getElementById('menu_player_container')

    console.log(newOffset);

    player.style.transition = "0.4s ease"
    player.style.left = newOffset.x + "px"
    player.style.top = newOffset.y + "px"
}

function getVector(startCords, endCords) {
    vectorX = endCords.x - startCords.x
    vectorY = endCords.y - startCords.y

    return {
        x: vectorX,
        y: vectorY
    }
}

function getBoundingBox() {
    windowInnerWidth = window.innerWidth
    windowInnerHeight = window.innerHeight
    windowHalfWidth = Math.floor(windowInnerWidth / 2)
    windowHalfHeight = Math.floor(windowInnerHeight / 2)

    boundingBox = [
        topLeft = {
            name : "topLeft",
            p1 : {
                x: 0,
                y: windowHalfHeight
            },
            p2 : {
                x: windowHalfWidth,
                y: 0
            }
        },
        topRight = {
            name : "topRight",
            p1 : {
                x: windowHalfWidth,
                y: 0
            },
            p2 : {
                x: windowInnerWidth,
                y: windowHalfHeight
            }
        },
        bottomLeft = {
            name : "bottomLeft",
            p1 : {
                x: windowHalfWidth,
                y: windowInnerHeight
            },
            p2 : {
                x: 0,
                y: windowHalfHeight
            }
        },
        bottomRight = {
            name : "bottomRight",
            p1 : {
                x: windowInnerWidth,
                y: windowHalfHeight
            },
            p2 : {
                x: windowHalfWidth,
                y: windowInnerHeight
            }
        }
    ]

    return boundingBox
}

function lineIntersection(line1,line2) {

    var det, gamma, lambda;
    det = (line1.p2.x - line1.p1.x) * (line2.p2.y - line2.p1.y) - (line2.p2.x - line2.p1.x) * (line1.p2.y - line1.p1.y);
    if (det === 0) {
      return false;
    } else {
      lambda = ((line2.p2.y - line2.p1.y) * (line2.p2.x - line1.p1.x) + (line2.p1.x - line2.p2.x) * (line2.p2.y - line1.p1.y)) / det;
      gamma = ((line1.p1.y - line1.p2.y) * (line2.p2.x - line1.p1.x) + (line1.p2.x - line1.p1.x) * (line2.p2.y - line1.p1.y)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}


function getDirection(startCords, endCords) {
    vector = getVector(startCords, endCords)
    vecTorXEnd = vector.x * 10
    vecTorYEnd = vector.y * 10

    vectorLine = {
        p1: {
            x: startCords.x,
            y: startCords.y
        },
        p2: {
            x: vecTorXEnd,
            y: vecTorYEnd
        }
    }

    boundingBox = getBoundingBox()

    for (let index = 0; index < boundingBox.length; index++) {
        if(index == currentPositionIndex) continue
        const boundingLine = boundingBox[index];

        if(lineIntersection(vectorLine, boundingLine)) {
            currentPositionIndex = index
            return boundingLine.name
        }
    }

    return "neutral"
}

function getOffset(direction) {
    offsetLeft = 80
    offsetTop = 60

    switch(direction) {
        case "topRight":
            offsetLeft = window.innerWidth - player.offsetWidth - 12 // 12 is width of scrollbar
            if (topBarVisible) offsetTop = 60
            else offsetTop = -10
            break;
        case "topLeft":
            offsetLeft = 60
            offsetTop = 50
            break;
        case "bottomLeft":
            offsetLeft = 60
            offsetTop = window.innerHeight - 120 //30 is margin around player
            break;
        case "bottomRight":
            offsetLeft = window.innerWidth - player.offsetWidth - 12 - 60 // 12 is width of scrollbar
            offsetTop = window.innerHeight - 120 //30 is margin around player
            break;
        default:
            return null
    }

    return {
        x: offsetLeft,
        y: offsetTop
    }

}

function menuSlidePlayer(direction) {
    player = document.getElementById('menu_player_container')
    switch(playerCurrentPosition) {
        case "topLeft":
        case "bottomLeft":
            player.style.animation = "playerChangePosition" + direction + " 0.25s forwards"
            return
        default:
            return
    }
}

function getCurrentPlayerPosition() {
    return getCurrentPlayerPosition
}