class Menu {
    #viewController = null;
    #messageBroker = null;

    constructor(viewController) {
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#registerListeners();
    }

    #registerListeners() {
        const searchInput = document.getElementById('top_search_input');
        this.#messageBroker.createTopic('searchInput');
        searchInput.addEventListener('input', (event) => {
            const input = event.target.value;
            this.#messageBroker.publish('searchInput', input);
        });
    }


}