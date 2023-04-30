class TestView extends View {
    #viewHTML = null;
    #type = null;
    #HTMLContainer = null;
    #data = null;
    
    constructor(type, data) {
        super();
        return this.#constructorMethod(type, data);
    }

    //implemeneted methods

    async #constructorMethod(type, data) {
        await this.#createView(type, data);
        return this
      }

    show(viewController) {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
        viewPort.appendChild(this.#viewHTML);
    }

    hide() {
        const viewPort = document.getElementById('viewport');
        viewPort.innerHTML = '';
    }

    async #createView(type, data) {
        this.#data = data;
        this.#type = type;

        const returnValues = this.createHTMLContainer('Test View', 'test_view');
        this.#viewHTML = returnValues.container
    }

    async updateView() {
        console.log('updateView');
    }

    getHTML() {
        return this.#viewHTML;
    }

    getHTMLContainer() {
        return this.#viewHTML;
    }

    getType() {
        return this.#type;
    }

}