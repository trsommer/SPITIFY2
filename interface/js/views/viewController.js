class ViewController {
  #singletonViews = {}
  #messageBroker = null
  #menu = null
  #player = null
  #queue = null
  #lastSearch = "" //will be replaced with object that stores various data
  #currentView = null
  #nextSearchView = null
  #lastViews = []
  #contextMenus = []
  #lastSearchListView = null
  constructor() {
    if (ViewController.instance) {
      return ViewController.instance
    }
    ViewController.instance = this
    this.views = {}
    this.currentView = null
    return this.#constructorFunction()
  }

  async #constructorFunction() {
    this.#messageBroker = new MessageBroker()
    await this.#createSingletonViews()
    this.#createNextSearchView()
    this.#menu = new Menu(this)
    this.#registerViewListeners()
    this.#setInitialView()
    this.#player = await new Player(this)
    this.#queue = await new Queue(this.#player, this)
    this.#createBackwardForwardNavigators()
    return this
  }

  /**
   * Registers Listeners that are not related to any single view (e.g. search click because search view is not static)
   * but control the view switching.
   */
  #registerViewListeners() {
    const SEARCH_INPUT = document.getElementById("top_search_input")
    const SEARCH_CLEAR_BUTTON = document.getElementById("top_search_clear_icon")
    const MENU_LEFT = document.getElementById("menu_left")
    SEARCH_INPUT.addEventListener("click", (event) => {
      const input = event.target.value
      const query = input.trim()
      if (query == "" && !(this.#currentView instanceof LastSearchesView)) {
        this.switchView("lastSearches", null)
        return
      }
      if (query != "" && !(this.#currentView instanceof SearchView)) {
        this.switchView("search", null)
      }
    })
    SEARCH_INPUT.addEventListener("input", (event) => {
      const query = event.target.value
      this.#handleSearchInput(query)
    })

    SEARCH_CLEAR_BUTTON.addEventListener("click", (event) => {
      this.switchView("lastSearches", null)
      SEARCH_INPUT.value = ""
    })

    MENU_LEFT.addEventListener("mouseenter", (event) => {
      this.#messageBroker.publish("leftMenu", true)
      MENU_LEFT.addEventListener(
        "mouseleave",
        (event) => {
          this.#messageBroker.publish("leftMenu", false)
        },
        { once: true }
      )
    })
  }

  /*
     *  data: [
            entry1: {
                title: "title",
                callback: function() {},
                suMenu: null
            },

        ]
    */

  #setInitialView() {
    const VIEW = this.#singletonViews["lastSearches"]
    this.#currentView = VIEW
    VIEW.show()
  }

  /**
   * Asynchronously switches to a new view based on the provided view type and data.
   * @param {string} viewType - The type of view to switch to.
   * @param {*} data - The data to pass to the new view.
   * @throws {Error} If an invalid view type is provided.
   * @returns {Promise<void>}
   */
  async switchView(viewType, data) {
    let newView = null
    let singletonView = false
    switch (viewType) {
      //dynamic views
      case "artist":
      case "album":
      case "playlist":
        newView = await this.#viewFactory(viewType, data)
        break
      case "searchList":
        newView = await this.#getSearchListView(data)
        break
      //singleton views
      case "playlists":
      case "settings":
      case "download":
      case "lastSearches":
        newView = this.#singletonViews[viewType]
        singletonView = true
        //await newView.updateView();
        break
      case "search":
        newView = this.#getSearchView()
        break
      default:
        throw new Error("Invalid view type")
    }
    this.#menu.setMenu(viewType)
    this.#currentView.hide()
    newView.show()
    if (singletonView == false) this.#lastViews.push(this.#currentView)
    this.#currentView = newView
    this.#hideContextMenu()
    if (this.#lastViews.length > 0) {
      this.#showBackwardNavigator()
    }
    this.#scrollToTop()
  }

  /**
   * Creates and returns a new view based on the given view type and data.
   * @async
   * @param {string} viewType - The type of view to create.
   * @param {*} data - The data to pass to the view.
   * @returns {Promise<View>} - A Promise that resolves with the created view.
   * @throws {Error} - If the view type is invalid.
   */
  async #viewFactory(viewType, data) {
    switch (viewType) {
      case "artist":
        return new ArtistView(data, this)
      case "album":
        return new AlbumView(data, this)
      case "playlist":
        return new PlaylistView(data, this)
      case "playlists":
        return new PlaylistsView(data, this)
      case "search":
        return new SearchView(data, this)
      case "searchList":
        return new SearchListView(data, this)
      case "download":
        return new DownloadView(data, this)
      case "settings":
        return new SettingsView(data, this)
      case "lastSearches":
        return new LastSearchesView(data, this)
      default:
        throw new Error("Invalid view type")
    }
  }

  /**
   * Asynchronously creates singleton views for playlists, settings, downloads, and
   * last searches using the view factory.
   *
   * @returns {Promise<void>} A promise that resolves when all the singleton views have
   * been created.
   */
  async #createSingletonViews() {
    this.#singletonViews["playlists"] = await this.#viewFactory("playlists")
    //this.#singletonViews["settings"] = await this.#viewFactory("settings");
    this.#singletonViews["download"] = await this.#viewFactory("download")
    this.#singletonViews["lastSearches"] = await this.#viewFactory("lastSearches")
  }

  async #createNextSearchView() {
    this.#nextSearchView = await this.#viewFactory("search")
  }

  #getSearchView() {
    const nextSearchView = this.#nextSearchView
    return nextSearchView
  }

  #createBackwardForwardNavigators() {
    const backwardNavigator = document.getElementById("menu_top_backward_navigator")
    const forwardNavigator = document.getElementById("menu_top_forward_navigator")

    backwardNavigator.addEventListener("click", this.#switchToPrevView.bind(this))
  }

  #switchToPrevView() {
    const lastView = this.#lastViews.pop()
    this.#currentView.hide()
    lastView.show()
    this.#currentView = lastView
    if (this.#lastViews.length == 0) {
      this.#hideBackwardNavigator()
    }
  }

  #showBackwardNavigator() {
    const buttonContainer = document.getElementById("menu_top_forward_backward_navigator_container")
    buttonContainer.style.marginLeft = "20px"
    const backwardNavigator = document.getElementById("menu_top_backward_navigator")
    backwardNavigator.style.width = "40px"
  }

  #hideBackwardNavigator() {
    const buttonContainer = document.getElementById("menu_top_forward_backward_navigator_container")
    buttonContainer.style.marginLeft = "0"
    const backwardNavigator = document.getElementById("menu_top_backward_navigator")
    backwardNavigator.style.width = "0px"
  }

  async #getSearchListView(data) {
    console.log(this.#lastSearch)
    if (this.#lastSearch == data.query && this.#lastSearchListView) {
      this.#lastSearchListView.updateSelectedPosition(data.position)
      return this.#lastSearchListView
    }
    const newView = await this.#viewFactory("searchList", data)
    this.#lastSearchListView = newView
    return newView
  }

  #handleSearchInput(input) {
    const query = input.trim()
    if (query.length === 0) {
      this.switchView("lastSearches", null)
      this.#lastSearch = ""
      return
    }
    if (query === this.#lastSearch) return
    if (!(this.#currentView instanceof SearchView)) {
      this.switchView("search", null)
    }
    this.#lastSearch = query
    getSpotifySearchResultsNoArgs(query)
  }

  /**
   * Returns the private message broker of the class.
   *
   * @returns {MessageBroker} The private message broker of the class.
   */
  getMessageBroker() {
    return this.#messageBroker
  }

  getCurrentView() {
    return this.#currentView
  }

  getMenu() {
    return this.#menu
  }

  addContextMenu(contextMenu) {
    this.#contextMenus.push(contextMenu)
  }

  #hideContextMenu() {
    this.#contextMenus.forEach((contextMenu) => {
      contextMenu.hide()
    })
  }

  getQueue() {
    return this.#queue
  }

  getPlayer() {
    return this.#player
  }

  #scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    })
  }
}
