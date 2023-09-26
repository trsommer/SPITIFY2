class PlayerMoveController {
  #viewController = null
  #messageBroker = null
  #playerHtmlController = null
  #leftMenuStatus = false
  #topMenuStatus = true
  #playerHTMLContainer = null
  #disabledMove = false
  #startCords = null
  #startOffset = null
  #endCords = null
  #newOffset = null
  #startDate = null
  #currentPosition = 0 // 0 - bottomLeft, 1 - topLeft, 2 - topRight, 3 - bottomRight
  #menuTopOffset = false

  constructor(viewController, playerHtmlController) {
    this.#viewController = viewController
    this.#messageBroker = viewController.getMessageBroker()
    this.#playerHtmlController = playerHtmlController
    this.#subscribeToTopics()
    this.#registerListeners()

    console.log("playerMoveController")
  }

  //menu updates

  #subscribeToTopics() {
    const MESSAGE_BROKER = this.#messageBroker
    MESSAGE_BROKER.subscribe("leftMenu", this.#menuLeftUpdateCallback.bind(this))
    MESSAGE_BROKER.subscribe("topMenu", this.#menuTopUpdateCallback.bind(this))
  }

  #menuLeftUpdateCallback(leftMenuStatus) {
    this.#leftMenuStatus = leftMenuStatus
    this.#menuLeftPlayerPush(leftMenuStatus)
  }

  #menuTopUpdateCallback(topMenuStatus) {
    this.#topMenuStatus = topMenuStatus
    this.#menuTopPlayerPush(topMenuStatus)
  }

  //listeners

  #registerListeners() {
    this.#playerHTMLContainer = this.#playerHtmlController.getPlayerHtmlContainer()
    const PLAYER_CONTAINER = this.#playerHTMLContainer

    PLAYER_CONTAINER.addEventListener(
      "mousedown",
      (e) => {
        if (e.target.nodeName == "INPUT") {
          return
        }
        this.#startMovePlayer(e, PLAYER_CONTAINER)
      },
      false
    )
  }

  #startMovePlayer(e, playerContainer) {
    e.preventDefault()
    if (this.#disabledMove) return
    playerContainer.classList.remove("player_cursor_up")
    playerContainer.classList.add("player_cursor_down")

    this.#startCords = {
      x: e.clientX,
      y: e.clientY
    }

    this.#startOffset = {
      x: playerContainer.offsetLeft - 20,
      y: playerContainer.offsetTop - 20
    }

    playerContainer.className = ""
    playerContainer.style.cssText = ""

    playerContainer.style.top = this.#startOffset.y + "px"
    playerContainer.style.left = this.#startOffset.x + "px"
    playerContainer.style.cursor = "grabbing"

    console.log(this.#startCords)

    this.#startDate = new Date()

    document.onmousemove = (e) => {
      this.#movePlayer(e, playerContainer)
    }

    document.onmouseup = (e) => {
      this.#endMovePlayer(e, playerContainer)
    }
  }

  #movePlayer(e, playerContainer) {
    e.preventDefault()
    const POS_X = e.clientX
    const POS_Y = e.clientY

    const OFFSET_Y = this.#startCords.y - POS_Y
    let OFFSET_X = POS_X - this.#startCords.x

    this.#newOffset = {
      x: OFFSET_X,
      y: OFFSET_Y
    }

    playerContainer.style.left = this.#startOffset.x + OFFSET_X + "px"
    playerContainer.style.top = this.#startOffset.y - OFFSET_Y + "px"
  }

  #endMovePlayer(e, playerContainer) {
    e.preventDefault()
    document.onmousemove = null
    document.onmouseup = null

    this.#endCords = {
      x: e.clientX,
      y: e.clientY
    }

    playerContainer.style.cursor = "grab"

    const VELOCITY = this.#calculateVelocity()
    const ANGLE = this.#getVectorAngle(this.#startCords, this.#endCords)
    console.log(VELOCITY)
    console.log(ANGLE)

    const THAT = this

    playerContainer.addEventListener(
      "transitionend",
      async function () {
        THAT.#clearPlayerStyles(playerContainer)
        THAT.#setFinalPosition(playerContainer)
      },
      { once: true }
    )

    if (VELOCITY > 500) {
      const NEXT_POSITION_INDEX = this.#getNextPositionIndex(ANGLE)
      const NEW_POSITION = this.#getNextPosition(NEXT_POSITION_INDEX)
      this.#currentPosition = NEXT_POSITION_INDEX
      this.#animatePlayer(playerContainer, NEW_POSITION)
    } else {
      const NEW_POSITION = this.#getNextPosition(this.#currentPosition)
      this.#animatePlayer(playerContainer, NEW_POSITION)
    }
  }

  #calculateVelocity() {
    const END_DATE = new Date()
    const TIME_DIFF = (END_DATE.getTime() - this.#startDate.getTime()) / 1000
    const VECTOR_DISTANCE = Math.sqrt(Math.pow(this.#endCords.x - this.#startCords.x, 2) + Math.pow(this.#endCords.y - this.#startCords.y, 2))

    return VECTOR_DISTANCE / TIME_DIFF
  }

  #getVectorAngle(startCords, endCords) {
    const X_DIFF = endCords.x - startCords.x
    const Y_DIFF = endCords.y - startCords.y
    const ANGLE = Math.atan2(Y_DIFF, X_DIFF)
    var DEGREES = (ANGLE * 180) / Math.PI
    return (360 + Math.round(DEGREES)) % 360

    //add offset to account for starting position of player (90 * x deg offset steps)
  }

  #getNextPositionIndex(angle) {
    const POSITIONS = ["BottomLeft", "TopLeft", "TopRight", "BottomRight"]
    let positionIndex = -1
    const OFFSET_ANGLE = this.#getOffsetAngle(angle)

    if (OFFSET_ANGLE > 45 && OFFSET_ANGLE <= 225) {
      positionIndex = 0
    } else if (OFFSET_ANGLE > 225 && OFFSET_ANGLE <= 285) {
      positionIndex = 1
    } else if (OFFSET_ANGLE > 285 && OFFSET_ANGLE <= 345) {
      positionIndex = 2
    } else {
      positionIndex = 3
    }

    const FINAL_POSITION = (positionIndex + this.#currentPosition) % 4

    return FINAL_POSITION
  }

  /**
   * rotates the angle fiven accordig to the current position
   * @param {number} angle - The angle to calculate the offset from.
   * @returns {number} The calculated offset angle.
   */
  #getOffsetAngle(angle) {
    const OFFSET_ANGLE = angle - this.#currentPosition * 90
    return OFFSET_ANGLE < 0 ? OFFSET_ANGLE + 360 : OFFSET_ANGLE
  }

  #getNextPosition(positionIndex) {
    //        const POSITIONS = ["BottomLeft", "TopLeft", "TopRight", "BottomRight"];
    switch (positionIndex) {
      case 0:
        return { left: 60, top: window.innerHeight - 160 } //BottomLeft
      case 1:
        return { left: 60, top: 60 } //TopLeft
      case 2:
        return { left: window.innerWidth - 490, top: this.#topMenuStatus ? 60 : -11 } //TopRight
      case 3:
        return { left: window.innerWidth - 490, top: window.innerHeight - 160 } //BottomRight
    }
  }

  #animatePlayer(container, newPosition) {
    console.log(newPosition)

    container.style.transition = "0.3s ease"
    container.style.left = newPosition.left + "px"
    container.style.top = newPosition.top + "px"
  }

  #clearPlayerStyles(container) {
    container.style.transition = null
    container.style.left = null
    container.style.top = null
  }

  #setFinalPosition(container) {
    const FINAL_POSITION_CLASS = ["bottomLeft", "topLeft", "topRight", "bottomRight"]
    const FINAL_POSITION = FINAL_POSITION_CLASS[this.#currentPosition]

    if (this.#currentPosition == 2 && !this.#topMenuStatus) {
      container.classList.add("topRightOffset")
    } else {
      container.classList.add(FINAL_POSITION)
    }
  }

  //menu updates

  #menuLeftPlayerPush(status) {
    const PLAYER_CONTAINER = this.#playerHTMLContainer
    const PLAYER_POSITION = this.#currentPosition

    if (PLAYER_POSITION > 1) {
      return
    }

    if (status) {
      PLAYER_CONTAINER.style.transition = "0.25s ease"
      PLAYER_CONTAINER.style.left = "180px"
    } else {
      PLAYER_CONTAINER.style.transition = "0.25s ease"
      PLAYER_CONTAINER.style.left = "60px"
    }
  }

  #menuTopPlayerPush(status) {
    const PLAYER_CONTAINER = this.#playerHTMLContainer
    const PLAYER_POSITION = this.#currentPosition
    console.log(status)

    if (PLAYER_POSITION == 2) {
      if (!status) {
        PLAYER_CONTAINER.style.transition = "0.25s ease"
        PLAYER_CONTAINER.style.top = "-11px"
      } else {
        PLAYER_CONTAINER.style.transition = "0.25s ease"
        PLAYER_CONTAINER.style.top = "60px"
      }
    }

    return
  }
}
