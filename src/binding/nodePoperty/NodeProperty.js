import "../../types.js";

export class NodeProperty {
  /** @type {Node} */
  #node;
  get node() {
    return this.#node;
  }
  set node(value) {
    this.#node = value;
  }

  /** @type {string} */
  #propertyName;
  get propertyName() {
    return this.#propertyName;
  }
  set propertyName(value) {
    this.#propertyName = value;
    this.#propertyNameElements = value.split(".");
  }

  /** @type {string[]} */
  #propertyNameElements = [];
  get propertyNameElements() {
    return this.#propertyNameElements;
  }

  /** @type {any} */
  get value() {
    return this.node[this.propertyName];
  }
  set value(value) {
    this.node[this.propertyName] = value;
  }

}