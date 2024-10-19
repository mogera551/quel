import { IPropBuffer } from "./types";

class PropBuffer {
  #buffer: IPropBuffer | undefined;
  #setBuffer(buffer) {
    this.#buffer = buffer;
    for(const key in buffer) {
      this.#bindProperty(key);
      this.#component.viewModel[Symbols.notifyForDependentProps](key, []);
    }
  }

  #getBuffer() {
    return this.#buffer;
  }

  #clearBuffer() {
    this.#buffer = undefined;
  }

  #createBuffer() {
    let buffer;
    buffer = this.#component.parentComponent.readOnlyViewModel[Symbols.createBuffer](this.#component);
    if (typeof buffer !== "undefined") {
      return buffer;
    }
    buffer = {};
    this.#binds.forEach(({ prop, propAccess }) => {
      const loopIndexes = contextLoopIndexes(this, propAccess);
      buffer[prop] = this.#component.parentComponent.readOnlyViewModel[Symbols.directlyGet](propAccess.name, loopIndexes);     
    });
    return buffer;
  }

  #flushBuffer() {
    if (typeof this.#buffer !== "undefined") {
      const result = this.#component.parentComponent.writableViewModel[Symbols.flushBuffer](this.#buffer, this.#component);
      if (result !== true) {
        this.#binds.forEach(({ prop, propAccess }) => {
          const loopIndexes = contextLoopIndexes(this, propAccess);
          this.#component.parentComponent.writableViewModel[Symbols.directlySet](propAccess.name, loopIndexes, this.#buffer[prop]);     
        });
      }
    }
  }

  #clear() {
    this.#buffer = undefined;
    this.#binds = [];
    for(const [key, desc] of Object.entries(this.#saveBindProperties)) {
      Object.defineProperty(this.#component.baseViewModel, key, desc);
    }
    this.#saveBindProperties = {};
  }

}
