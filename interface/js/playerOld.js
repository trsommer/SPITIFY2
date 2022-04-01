/*

var playerSize = 1
var playerPosition = 0
var playerCords = [60, 0]
var originalOffsetBottom = 0
let player = document.querySelector("#menu_player_container")
var originalOffsetLeft = 0
var playerMouseDownBool = false
var mouseDownTime
var mouseUpTime
var startPos = [0,0]
var setStartingPos = false
var clickOffset

var originalMousePos //mouse down pos
var moveMousePos //mouse move pos
var endMousePos //mouse up pos




function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function changePlayerSize() {
    coverContainer = document.getElementById("menu_player_cover_container")
    playerInfo = document.getElementById("menu_player_info")
    player = document.getElementById("menu_player")

    if (playerSize == 1) {
        playerSize = 0
        playerInfo.style.display = "none"
        player.style.animation = "playerTransformIn 0.25s forwards"
        coverContainer.style.animation = "changePlayerCoverSizeIn 0.25s forwards"
    } else {
        playerSize = 1
        playerInfo.style.display = "block"
        player.style.animation = "playerTransformOut 0.25s forwards"
        coverContainer.style.animation = "changePlayerCoverSizeOut 0.25s forwards"
    }
}

// 0 bottom left, 1 top left, 2 top right, 3 bottom right


async function positionPlayer(pos) {
    playerContainer = document.getElementById("menu_player_container")
    windowInnerHeight = window.innerHeight
    windowInnerWidth = window.innerWidth
    offsetWhenTop = window.innerHeight - 60 - playerContainer.offsetHeight
    offsetWhenRight = windowInnerWidth - playerContainer.offsetWidth - 12
    playerPosition = pos

    switch(pos) {
        case 0:
            bottomOffset = "0px" 
            leftOffset = "60px"
            break
        case 1:
            bottomOffset = "" + offsetWhenTop + "px"
            leftOffset = "60px"
            break
        case 2:
            bottomOffset = "" + offsetWhenTop + "px"
            leftOffset = "" + offsetWhenRight + "px"
            break
        case 3:
            bottomOffset = "0px" 
            leftOffset = "" + offsetWhenRight + "px"
            break
        default:
            break
    }

    playerContainer.style.setProperty('--offsetBottom', `${bottomOffset}`)
    playerContainer.style.setProperty('--offsetLeft', `${leftOffset}`)

    playerContainer.style.animation = "movePlayerBottomRight ease-out 0.5s forwards"

    console.log(playerPosition);
}


function playerMouseDown() {
    if (playerMouseDownBool == true) return

    console.log("mouse down");

    playerMouseDownBool = true
    mouseDownTime = new Date().valueOf()
    playerContainer = document.getElementById("menu_player_container")
    originalOffsetBottom = window.getComputedStyle(playerContainer).getPropertyValue('bottom')
    originalOffsetLeft = window.getComputedStyle(playerContainer).getPropertyValue('left')
    windowHeight = window.innerHeight
    e = window.event
    originalMousePos = getCursorCords(e)

    clickOffset = [originalMousePos[0] - playerCords[0], originalMousePos[1]]


    console.log("originalMousePos: x: " + originalMousePos[0] + ", y: " + originalMousePos[1]);
    console.log("originalOffset: bottom: " + originalOffsetBottom+ ", left: " + originalOffsetLeft);

    console.log("clickOffset: " + clickOffset)
}

function getCursorCords(e) {
    return [e.clientX, e.clientY]
}


function playerMouseUp() {

    return

    if (playerMouseDownBool == false) return

    mouseUpTime = new Date().valueOf()
    playerMouseDownBool = false
    
    newE = window.event
    endMousePos = getCursorCords(newE)
    
    console.log("endMousePos: x: " + endMousePos[0] + ", y: " + endMousePos[1]);


    vector = [endMousePos[0] - originalMousePos[0], endMousePos[1] - originalMousePos[1]]

    console.log(originalMousePos);

    setStartingPos = false

    length = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2))

    timeDifference = (mouseUpTime - mouseDownTime) / 1000 // in seconds

    velocity = length / timeDifference

    //boundaryLines = getBoundaryLines()

    console.log("velocity: " + velocity);

    if (velocity < 800) {
        positionPlayer(playerPosition)
    } else {
        lines = getBoundaryLines()
    
        vector = [vector[0] * 100, vector[1] * 100]

        line = [endMousePos[0], endMousePos[1], vector[0], vector[1]]

        console.log(lines);

        console.log(line + " test")

        var newPosition

        if (lineIntersection(lines[0], line) && playerPosition != 0) {
            newPosition = 0
        } else if (lineIntersection(lines[1], line) && playerPosition != 1) {
            newPosition = 1
        } else if (lineIntersection(lines[2], line) && playerPosition != 2) {
            newPosition = 2
        } else if (lineIntersection(lines[3], line) && playerPosition != 3) {
            newPosition = 3
        } else {
            newPosition = playerPosition
        }

        console.log("new position: " + newPosition);

        positionPlayer(newPosition)
    }
}

function getBoundaryLines() {
    windowInnerWidth = window.innerWidth
    windowInnerHeight = window.innerHeight
    windowHalfWidth = Math.floor(windowInnerWidth / 2)
    windowHalfHeight = Math.floor(windowInnerHeight / 2)

    lineBottomLeft = [windowHalfWidth, windowInnerHeight, 0, windowHalfHeight]
    lineTopLeft = [0, windowHalfHeight, windowHalfWidth, 0]
    lineTopRight = [windowHalfWidth, 0, windowInnerWidth, windowHalfHeight]
    lineBottomRight = [windowInnerWidth, windowHalfHeight, windowHalfWidth, windowInnerHeight]

    return [lineBottomLeft, lineTopLeft, lineTopRight, lineBottomRight]
}

function lineIntersection(line1,line2) {
    a = line1[0]
    b = line1[1]
    c = line1[2]
    d = line1[3]

    p = line2[0]
    q = line2[1]
    r = line2[2]
    s = line2[3]

    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}



/*
function playerMouseMove() {

    if (playerMouseDownBool == false) return

    playerContainer = document.getElementById("menu_player_container")
    var e = window.event
    moveMousePos = getCursorCords(e)

    if (setStartingPos == false) {
        endMousePos = moveMousePos
        setStartingPos = true
    }

    mouseOffset = [originalMousePos[0] - moveMousePos[0], originalMousePos[1] - moveMousePos[1]]

    //richtig

    console.log(playerCords)
    console.log(mouseOffset)

   newBottomOffset = playerCords[0] + mouseOffset[1]
   newLeftOffset   = playerCords[1] - mouseOffset[0]

    if (newLeftOffset < 60) {
        newLeftOffset = 60
    }

    bo = "" + newBottomOffset + "px"
    lo = "" + newLeftOffset + "px"

    playerCords = [newBottomOffset, newLeftOffset]

    playerContainer.style.setProperty('bottom', `${bo}`)
    playerContainer.style.setProperty('left', `${lo}`)

    console.log(playerCords)
}


function playerMouseMove() {

    if (playerMouseDownBool == false) return

    playerContainer = document.getElementById("menu_player_container")
    var e = window.event
    moveMousePos = getCursorCords(e)

    newOffset = [moveMousePos[0] - clickOffset[0],Math.abs(moveMousePos[1] - clickOffset[1])]

    console.log(moveMousePos)
    console.log(clickOffset)

    bo = "" + newOffset[0] + "px"
    lo = "" + newOffset[1] + "px"

    playerContainer.style.setProperty('bottom', `${bo}`)
    playerContainer.style.setProperty('left', `${lo}`)

    console.log(playerCords)
}

*/