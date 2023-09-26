class Menu {
  #viewController = null
  #messageBroker = null
  #buttons = null
  #topBarVisible = true
  #menuLogoColorChangeStopped = false

  constructor(viewController) {
    this.#viewController = viewController
    this.#messageBroker = viewController.getMessageBroker()
    this.#registerListeners()
  }

  #registerListeners() {
    const BUTTONS = document.getElementsByClassName("menu_left_item")
    this.#buttons = BUTTONS

    const PLAYLIST_BUTTON = BUTTONS[0]
    PLAYLIST_BUTTON.addEventListener("click", () => {
      this.#viewController.switchView("playlists")
      this.#setButtonsActive(0)
    })

    const DOWNLOADS_BUTTON = BUTTONS[1]
    DOWNLOADS_BUTTON.addEventListener("click", () => {
      this.#viewController.switchView("download")
      this.#setButtonsActive(1)
    })

    const SETTINGS_BUTTON = BUTTONS[2]
    SETTINGS_BUTTON.addEventListener("click", () => {
      this.#viewController.switchView("settings")
      this.#setButtonsActive(2)
    })

    this.#messageBroker.subscribe("scroll", this.#topBarScroll.bind(this))
  }

  setMenu(view) {
    this.#setButtonsActivateBasedOnView(view)
    this.#setTopMenuBarVisivilityBasedOnView(view)
  }

  #setButtonsActivateBasedOnView(view) {
    switch (view) {
      case "playlists":
        this.#setButtonsActive(0)
        break
      case "downloads":
        this.#setButtonsActive(1)
        break
      case "settings":
        this.#setButtonsActive(2)
        break
      default:
        this.#setButtonsInactive()
        break
    }
  }

  #setTopMenuBarVisivilityBasedOnView(view) {
    switch (view) {
      case "playlist":
      case "artist":
      case "album":
        this.#setTopBarVisibility(false)
        break
      default:
        this.#setTopBarVisibility(true)
        break
    }
  }

  //left buttons

  #setButtonsActive(buttonIndex) {
    for (let i = 0; i < this.#buttons.length; i++) {
      const BUTTON = this.#buttons[i]
      if (i == buttonIndex) {
        BUTTON.classList.add("menu_button_active")
        BUTTON.classList.remove("menu_button_inactive")
      } else {
        BUTTON.classList.add("menu_button_inactive")
        BUTTON.classList.remove("menu_button_active")
      }
    }
  }

  #setButtonsInactive() {
    for (let i = 0; i < this.#buttons.length; i++) {
      const BUTTON = this.#buttons[i]
      BUTTON.classList.add("menu_button_inactive")
      BUTTON.classList.remove("menu_button_active")
    }
  }

  //top bar

  #setTopBarVisibility(visibility) {
    const topBar = document.getElementById("menu_top")
    topBar.style.opacity = visibility ? "0.95" : "0"
    this.#topBarVisible = visibility
    this.#messageBroker.publish("topMenu", visibility)
  }

  #topBarScroll(scrollData) {
    const currentViewType = this.#viewController.getCurrentView().getType()
    if (currentViewType != "artist_view") return

    const SCROLL_Y = scrollData.scrollY

    if (SCROLL_Y > 300 && !this.#topBarVisible) {
      this.#stopMenuLogoColorChange(false)
      this.#setTopBarVisibility(true)
      this.#changeHiddenHeadingVisibility(true, "menu_top_heading")
      this.#changeHiddenHeadingVisibility(true, "menu_top_button_play")
      this.#changeHiddenHeadingVisibility(true, "menu_top_button_follow")
    } else if (scrollY <= 300 && this.#topBarVisible) {
      this.#stopMenuLogoColorChange(true)
      this.#setTopBarVisibility(false)
      this.#changeHiddenHeadingVisibility(false, "menu_top_heading")
      this.#changeHiddenHeadingVisibility(false, "menu_top_button_play")
      this.#changeHiddenHeadingVisibility(false, "menu_top_button_follow")
    }
  }

  #changeHiddenHeadingVisibility(mode, id) {
    const element = document.getElementById(id)
    if (!mode) {
      element.style.transform = "translateX(-20px)"
      element.style.opacity = 0
      element.style.pointerEvents = "none"
    } else {
      element.style.transform = "translateX(0px)"
      element.style.opacity = 1
      element.style.pointerEvents = null
    }
  }

  #stopMenuLogoColorChange(mode) {
    const menuTopLogo = document.getElementById("menu_top_logo")
    const menuTopText = document.getElementById("menu_top_text")
    if (mode && !this.#menuLogoColorChangeStopped) {
      this.#menuLogoColorChangeStopped = true
      menuTopLogo.classList.remove("menu_top_logo")
      menuTopText.classList.remove("menu_top_text")
    }
    if (!mode && this.#menuLogoColorChangeStopped) {
      this.#menuLogoColorChangeStopped = false
      menuTopLogo.classList.add("menu_top_logo")
      menuTopText.classList.add("menu_top_text")
    }
  }

  setTopHeading(text) {
    const menuTopHeading = document.getElementById("menu_top_heading")
    menuTopHeading.innerHTML = text
  }

  //backwards navigator
}
