class View {
    constructor(data) {
      if (this.constructor == View) {
        throw new Error("Abstract classes can't be instantiated.");
      }
    }
    
    // Abstract methods

    async #constructorMethod(data) {
      throw new Error("Method 'constructorMethod()' must be implemented.");
    }

    show(viewController) {
      throw new Error("Method 'show()' must be implemented.");
    }

    hide() {
        throw new Error("Method 'hide()' must be implemented.");
    }

    async #createView(data) {
        throw new Error("Method 'createView()' must be implemented.");
    }

    async updateView() {
        throw new Error("Method 'updateView()' must be implemented.");
    }

    getHTMLContainer() {
        throw new Error("Method 'getHTML()' must be implemented.");
    }

    getHTMLContentContainer() {
        throw new Error("Method 'getHTMLContainer()' must be implemented.");
    }

    getType() {
        throw new Error("Method 'getType()' must be implemented.");
    }

    // common methods

    createHTMLContainer(title, id) {
      //create the outer container that contains the view
      const container = document.createElement('div');
      container.classList.add('view');
      container.setAttribute('id', id);

      //create the inner container that contains the view content
      const contentContainer = document.createElement('div');
      const contentContainerName = id + '_content';
      contentContainer.setAttribute('id', contentContainerName);

      if (title == "unbound") {
        contentContainer.classList.add('view_content_unbound');
      } else if (title != null) {
        //create the title container that contains the view title
        const titleContainer = document.createElement('div');
        titleContainer.classList.add('view_title');
        titleContainer.innerHTML = title;

        container.appendChild(titleContainer);
        contentContainer.classList.add('view_content');
      } else {
        contentContainer.classList.add('view_content_no_title');
      }

      container.appendChild(contentContainer);

      return {
        container: container,
        contentContainer: contentContainer
      };
    }
  }