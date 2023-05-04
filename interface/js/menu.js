class Menu {
    #viewController = null;
    #messageBroker = null;

    constructor(viewController) {
        this.#viewController = viewController;
        this.#messageBroker = viewController.getMessageBroker();
        this.#registerListeners();
    }

    #registerListeners() {
    }


}