class ContextMenu {
    #data = null;
    #parent = null;
    #container = null;

    /*
     *  data: [
            entry1: {
                title: "title",
                callback: function() {},
                suMenu: null
            },

        ]
    */


    constructor(data, parent, viewController) {
        this.#data = data;
        this.#parent = parent;

        const Container = this.#createContextMenu(data);

        this.#container = Container;
    }

    show() {
        const contextMenuContainer = document.getElementById("context_menu_container");
        contextMenuContainer.innerHTML = "";

        contextMenuContainer.appendChild(this.#container);
    }

    #createContextMenu(data) {
        const menuContainer = document.createElement('div');
        menuContainer.classList.add("context_menu");

        for (let i = 0; i < data.length; i++) {
            const entry = data[i];

            const entryContainer = document.createElement('div');
            entryContainer.classList.add('context_menu_item');
            entryContainer.addEventListener('click', entry.callback);

            const entryTitle = document.createElement('p');
            entryTitle.classList.add('context_menu_item_title');
            entryTitle.innerHTML = entry.title;

            entryContainer.appendChild(entryTitle);

            if (entry.subMenu != null) {
            //TODO: add submenu
            };

            menuContainer.appendChild(entryContainer);
        }

        return menuContainer;
    }
}