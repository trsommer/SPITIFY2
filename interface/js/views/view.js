class View {
    constructor() {
      if (this.constructor == View) {
        throw new Error("Abstract classes can't be instantiated.");
      }
    }
  
    // Abstract methods
    show() {
      throw new Error("Method 'show()' must be implemented.");
    }

    hide() {
        throw new Error("Method 'hide()' must be implemented.");
    }

    createView() {
        throw new Error("Method 'createView()' must be implemented.");
    }

    updateView() {
        throw new Error("Method 'updateView()' must be implemented.");
    }
  }