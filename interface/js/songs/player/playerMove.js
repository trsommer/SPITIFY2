position = 0
mouseDown = false;
startCords = null
endCords = null
startOffset = null
newOffset = null
startDate = null
currentPosition = "bottomLeft"
currentPositionIndex = 2
disabled = true

// player in animation
async function animatePlayerIn() {
    playerBG = document.getElementById('menu_player')
    playerImage = document.getElementById('menu_player_cover')
    playerText = document.getElementById('menu_player_text_container')
    sliderBig = document.getElementById('menu_player_slider')
    sliderSmall = document.getElementById('menu_player_volume_slider')
    button1 = document.getElementById('menu_player_icon0')
    button2 = document.getElementById('menu_player_icon1')
    button3 = document.getElementById('menu_player_icon2')
    button4 = document.getElementById('menu_player_icon3')
    sliderBig.progress = 0

    playerBG.style.animation = "playerBgIn 0.4s forwards"
    playerImage.style.animation = 'playerImageIn 0.6s forwards'
    playerText.style.animation = 'playerFadeIn 0.5s forwards'
    sliderBig.style.animation = 'playerSliderBigIn 0.5s forwards'
    sliderSmall.style.animation = 'playerSliderVolumeIn 0.5s forwards'
    button1.style.animation = 'playerFadeIn 0.5s forwards'
    await sleep(100)
    button2.style.animation = 'playerFadeIn 0.5s forwards'
    await sleep(100)
    button3.style.animation = 'playerFadeIn 0.5s forwards'
    await sleep(100)
    button4.style.animation = 'playerFadeIn 0.5s forwards'

    disabled = false;
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
    playerBg = document.getElementById('menu_player')
    playerBg.classList.remove('mouseUpCursor')
    playerBg.classList.add('mouseDownCursor')
    startCords = {
        x: e.clientX,
        y: e.clientY
    }
    startOffset = {
        x: player.offsetLeft,
        y: player.offsetTop
    }

    player.style.animation = ""
    player.style.top = startOffset.y + "px"
    player.style.right = "inherit"
    player.style.left = startOffset.x + "px"
    player.style.bottom = "inherit"

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
    player.style.bottom = "inherit";
}

function endMovePlayer(e) {
    e = e || window.event;
    e.preventDefault()
    mouseDown = false
    player = document.getElementById('menu_player_container')
    playerBg = document.getElementById('menu_player')
    startLeft = startOffset.x + "px"
    startTop="60px"

    endCords = {
        x: e.clientX,
        y: e.clientY
    }

    velocity = getVelocity()
    if (velocity > 500) {
        direction = getDirection(startCords, endCords)
        if(direction != "neutral") {
            offset = getOffset(direction)
            currentPosition = direction
            animationToPlayerPosition(offset)
        }
    }

    offset = getOffset(currentPosition)
    animationToPlayerPosition(offset)
    playerBg.classList.remove('mouseDownCursor')
    playerBg.classList.add('mouseUpCursor')

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

function animationToPlayerPosition(newOffset) {
    var root = document.querySelector(':root')
    player = document.getElementById('menu_player_container')
    root.style.setProperty('--endOffsetTop', newOffset.y + "px")
    root.style.setProperty('--endOffsetLeft', newOffset.x + "px")
    player.style.animation = "movePlayer 0.4s forwards"
}

function setPlayerPosition() {
    player = document.getElementById('menu_player_container')
    switch (currentPosition) {
        case "topLeft":
            player.style.top = "60px"
            player.style.left = "60px"
            player.style.bottom = "inherit"
            player.style.right = "inherit"
            return
        case "topRight":
            player.style.top = "60px"
            player.style.right = "0"
            player.style.bottom = "inherit"
            player.style.left = "inherit"
            return
        case "bottomLeft":
            player.style.bottom = "0"
            player.style.left = "60px"
            player.style.top = "inherit"
            player.style.right = "inherit"
            return
        case "bottomRight":
            player.style.bottom = "0"
            player.style.right = "0"
            player.style.top = "inherit"
            player.style.left = "inherit"
            return
        default:
            return
    }
    
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
    offsetLeft = 60
    offsetTop = 60

    switch(direction) {
        case "topRight":
            offsetLeft = window.innerWidth - player.offsetWidth - 12 // 12 is width of scrollbar
            offsetTop = 60
            break;
        case "topLeft":
            offsetLeft = 60
            offsetTop = 60
            break;
        case "bottomLeft":
            offsetLeft = 60
            offsetTop = window.innerHeight - document.getElementById('menu_player').offsetHeight - 30 //30 is margin around player
            break;
        case "bottomRight":
            offsetLeft = window.innerWidth - player.offsetWidth - 12 // 12 is width of scrollbar
            offsetTop = window.innerHeight - document.getElementById('menu_player').offsetHeight - 30 //30 is margin around player
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
    switch(currentPosition) {
        case "topLeft":
        case "bottomLeft":
            player.style.animation = "playerChangePosition" + direction + " 0.25s forwards"
            return
        default:
            return
    }
}