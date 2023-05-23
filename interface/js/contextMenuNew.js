class ContextMenu {
    #data = null;
    #parent = null;
    #container = null;
    #viewController = null;
    #cursorHeight = 0;
    #displayed = false;
    #subMenuTimeout = null;
    #subMenu = null;
    #messageBroker = null;
    #height = 0;
    #subMenues = [];

    /*
     *  data: [
            entry1: {
                title: "title",
                callback: function() {},
                suMenu: null
            },

        ]
    */

    //create 1 context menu for each type of context in a view. Then add the specific content via show() method.
    // e.g. playSong gets data via the show method

    constructor(data, parent, cursorHeight, viewController) {
        this.#data = data;
        this.#parent = parent;
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#cursorHeight = cursorHeight;

        const Container = this.#createContextMenu(data, parent);

        this.#container = Container;
    }

    show(data) {
        if (this.#displayed) {
            return;
        }
        this.#data = data;
        this.#displayed = true;
        const MENU_CONTAINER = this.#container;
        const contextMenuContainer = document.getElementById("context_menu_container");
        this.#setDimsAndShape(MENU_CONTAINER);
        this.#registerCloseClickListener();
        this.#messageBroker.subscribe("keyUp", this.#closeContextMenuKeyUpCallback.bind(this));

        contextMenuContainer.appendChild(MENU_CONTAINER);

        this.#viewController.addContextMenu(this);
    }

    hide() {
        if (!this.#displayed) {
            return;
        }
        this.#displayed = false;
        const MENU_CONTAINER = this.#container;
        const contextMenuContainer = document.getElementById("context_menu_container");

        this.#messageBroker.unsubscribe("keyUp", this.#closeContextMenuKeyUpCallback.bind(this));            this.#hideContextClickPlain();
        this.#hideContextClickPlain();
        contextMenuContainer.removeChild(MENU_CONTAINER);
        if (Number.isInteger(this.#parent)) {
            this.#messageBroker.publish("closeContextMenu", null);
        }
    }

    #createContextMenu(data, parent) {
        const menuContainer = document.createElement('div');
        menuContainer.classList.add("context_menu");

        this.#height = data.length * 32 + 10;

        for (let i = 0; i < data.length; i++) {
            const entry = data[i];

            const entryContainer = document.createElement('div');
            entryContainer.classList.add('context_menu_item');
            const that = this;
            entryContainer.addEventListener('click', function() {
                entry.callback(that.#data);
                that.hideSubMenues();
                that.hide();
            });

            const entryTitle = document.createElement('p');
            entryTitle.classList.add('context_menu_item_title');
            entryTitle.innerHTML = entry.title;

            entryContainer.appendChild(entryTitle);

            if (entry.subMenu != null) {

                const CURSOR_OFFSET = 5 + (i * 32) + 16;

                const SUB_MENU = new ContextMenu(entry.subMenu, this, CURSOR_OFFSET, this.#viewController);
                const subMenuConatainer = SUB_MENU.getContainer();

                entryContainer.addEventListener('mouseenter', () => {
                    SUB_MENU.show(this.#data);
                    this.#subMenu = SUB_MENU;
                    //hide open submenu stack
                });
            } else {
                entryContainer.addEventListener('mouseenter', () => {
                    this.hideSubMenues();
                });
            }

            menuContainer.appendChild(entryContainer);
        }

        return menuContainer;
    }

    #setDimsAndShape(MENU_CONTAINER) {
        const LEFT = this.#getLeft();
        const OFFSET_LEFT = LEFT.offsetLeft;
        const DIRECTION_LEFT = LEFT.direction;
        const TOP = this.#getTop();
        const OFFSET_TOP = TOP.offsetTop;
        const DIRECTION_TOP = TOP.direction;

        const DIRECTION = "context_" + DIRECTION_LEFT + "_" + DIRECTION_TOP;
        
        MENU_CONTAINER.style.top = OFFSET_TOP + "px";
        MENU_CONTAINER.style.left = OFFSET_LEFT + "px";

        MENU_CONTAINER.classList.add(DIRECTION);
    }

    #getLeft() {
        const PARENT = this.#parent;
        let parentOffsetLeft = 0;
        let childContextMenuOffset = 0;

        if (Number.isInteger(PARENT)) {
            parentOffsetLeft = PARENT;
        } else {
            parentOffsetLeft = PARENT.#getLeft().offsetLeft;
            childContextMenuOffset = 195;
        }

        //check if enough space to the right
        const SPACE_RIGHT = window.innerWidth - parentOffsetLeft - 195;

        if (SPACE_RIGHT > 220) {
            const OFFSET_LEFT = parentOffsetLeft + childContextMenuOffset;

            return {
                offsetLeft: OFFSET_LEFT,
                direction: "right"
            }
        }

        //container has to go to the left
        const OFFSET_LEFT = parentOffsetLeft - 195;


        return {
            offsetLeft: OFFSET_LEFT,
            direction: "left"
        };
    }

    #getTop() {
        const PARENT = this.#parent;
        let PARENT_OFFSET_TOP = 0;
        if (!Number.isInteger(PARENT)) {
            PARENT_OFFSET_TOP = PARENT.#getTop().offsetTop;
        }
        const CURSOR_HEIGHT = this.#cursorHeight;
        const HEIGHT = this.#height;

        const SPACE_BOTTOM = window.innerHeight - PARENT_OFFSET_TOP - CURSOR_HEIGHT - HEIGHT;

        if (SPACE_BOTTOM > 25) {
            //enough space to the bottom

            const OFFSET_TOP = PARENT_OFFSET_TOP + CURSOR_HEIGHT;

            return {
                offsetTop: OFFSET_TOP,
                direction: "bottom"
            };
        }

        //not enough space to the bottom

        const OFFSET_TOP = PARENT_OFFSET_TOP + CURSOR_HEIGHT - HEIGHT;

        return {
            offsetTop: OFFSET_TOP,
            direction: "top"
        };
    }

    getContainer() {
        return this.#container;
    }

    hideSubMenues() {
        const SUB_MENU = this.#subMenu;

        if (SUB_MENU != null) {
            SUB_MENU.hideSubMenues();
            SUB_MENU.hide();
        }
    }

    #registerCloseClickListener() {
        const that  = this;
        const context_click_plain = document.getElementById("context_menu_mouse_listener");
        context_click_plain.style.display = "block";

        context_click_plain.addEventListener('click', () => {
            that.hide();
        }, {once: true});
    }

    #hideContextClickPlain() {
        const context_click_plain = document.getElementById("context_menu_mouse_listener");
        context_click_plain.style.display = "none";
    }

    #closeContextMenuKeyUpCallback(event) {
        if (event.key === "Escape") {
            this.hide();
        }
    }
}