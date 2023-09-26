class MessageBroker {
    #PushTopics = {};
    #PullTopics = {};

    constructor() {
        this.#registerListeners();
    }

    //Push

    #registerListeners() {
        const that = this;
        this.createPushTopic("scroll");
        window.addEventListener("scroll", (event) => {
            const SCROLL_X = window.scrollX;
            const SCROLL_Y = window.scrollY;
            const SCROLL_DATA = {
                scrollX: SCROLL_X,
                scrollY: SCROLL_Y
            };
            that.publish("scroll", SCROLL_DATA);
        });
        this.createPushTopic("resize");
        window.addEventListener("resize", (event) => {
            that.publish("resize", event);
        });
        this.createPushTopic("updateSpotifySearch");
        window.electronAPI.updateSpotifySearch((event, response) => {
            that.publish("updateSpotifySearch", response);
        });
        this.createPushTopic("keyUp");
        window.addEventListener("keyup", (event) => {
            event.preventDefault();
            that.publish("keyUp", event);
        });
        this.createPushTopic("addLastSearch");
        this.createPushTopic("closeContextMenu");
        this.createPushTopic("leftMenu")
        this.createPushTopic("topMenu");
    }

    /**
     * Creates a new push topic (listener is notifed)
     * 
     * @param {string} topicName - The name of the topic to create.
     * @throws {Error} If the topic already exists.
     */
    createPushTopic(topicName) {
        if (this.#PushTopics[topicName]) {
            throw new Error("Topic already exists");
        }
        this.#PushTopics[topicName] = [];
    }

    /**
     * Subscribe a callback function to the given topic.
     * 
     * @param {string} topicName - The name of the topic to subscribe to.
     * @param {function} callback - The callback function to be subscribed.
     * @throws {Error} If the topic does not exist.
     */
    subscribe(topicName, callback) {
        if (!this.#PushTopics[topicName]) {
            console.log(this.#PushTopics);
            throw new Error("Topic does not exist");
        }
        this.#PushTopics[topicName].push(callback);
    }

    /**
     * Removes a callback function from the list of subscribers for a given topic.
     *
     * @param {string} topicName - The name of the topic to unsubscribe from.
     * @param {function} callback - The callback function to remove from the subscribers list.
     * @throws {Error} If the topic does not exist in the list of topics.
     */
    unsubscribe(topicName, callback) {
        if (!this.#PushTopics[topicName]) {
            throw new Error("Topic does not exist");
        }
        const index = this.#PushTopics[topicName].indexOf(callback);
        if (index > -1) {
            this.#PushTopics[topicName].splice(index, 1);
        }
    }

    /**
     * Publishes data to a specified topic.
     * @param {string} topicName - The name of the topic to publish to.
     * @param {any} data - The data to publish.
     * @throws {Error} If the specified topic does not exist.
     */
    publish(topicName, data) {
        if (!this.#PushTopics[topicName]) {
            throw new Error("Topic does not exist or is not a PushTopic");
        }
        this.#PushTopics[topicName].forEach(callback => {
            callback(data);
        });
    }

    //Pull

    /**
     * Creates a new pull topic (listener must request data)
     * 
     * @param {string} topicName - The name of the topic to create.
     * @throws {Error} If the topic already exists.
     */
    createPullTopic(topicName, callBack) {
        if (this.#PullTopics[topicName]) {
            throw new Error("Topic already exists");
        }
        this.#PullTopics[topicName] = callBack;
    }

    async pull(topicName) {
        if (!this.#PullTopics[topicName]) {
            throw new Error("Topic does not exist");
        }
        
        const CALLBACK = this.#PullTopics[topicName];
        const DATA = await CALLBACK(); //maybe add error handling here

        return DATA;
    }
    
}