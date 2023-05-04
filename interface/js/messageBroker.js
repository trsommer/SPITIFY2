class Messagebroker {
    #topics = {};

    constructor() {
    }

    /**
     * Creates a new topic with the given name.
     * 
     * @param {string} topicName - The name of the topic to create.
     * @throws {Error} If the topic already exists.
     */
    createTopic(topicName) {
        if (this.#topics[topicName]) {
            throw new Error("Topic already exists");
        }
        this.#topics[topicName] = [];
    }

    /**
     * Subscribe a callback function to the given topic.
     * 
     * @param {string} topicName - The name of the topic to subscribe to.
     * @param {function} callback - The callback function to be subscribed.
     * @throws {Error} If the topic does not exist.
     */
    subscribe(topicName, callback) {
        if (!this.#topics[topicName]) {
            throw new Error("Topic does not exist");
        }
        this.#topics[topicName].push(callback);
    }

    /**
     * Removes a callback function from the list of subscribers for a given topic.
     *
     * @param {string} topicName - The name of the topic to unsubscribe from.
     * @param {function} callback - The callback function to remove from the subscribers list.
     * @throws {Error} If the topic does not exist in the list of topics.
     */
    unsubscribe(topicName, callback) {
        if (!this.#topics[topicName]) {
            throw new Error("Topic does not exist");
        }
        const index = this.#topics[topicName].indexOf(callback);
        if (index > -1) {
            this.#topics[topicName].splice(index, 1);
        }
    }

    /**
     * Publishes data to a specified topic.
     * @param {string} topicName - The name of the topic to publish to.
     * @param {any} data - The data to publish.
     * @throws {Error} If the specified topic does not exist.
     */
    publish(topicName, data) {
        if (!this.#topics[topicName]) {
            throw new Error("Topic does not exist");
        }
        this.#topics[topicName].forEach(callback => {
            callback(data);
        });
    }
}