import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

export class LoopContext {
  /** @type {LoopContext} */
  #parent;
  get parent() {
    return this.#parent;
  }

  /** @type {LoopContext} */
  #directParent;
  get directParent() {
    return this.#directParent;
  }

  /** @type {string} */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {number} */
  #index;
  get index() {
    return this.#index;
  }
  set index(value) {
    this.#index = value;
    this.#updated = true;
  }

  /** @type {boolean} */
  #updated = false;
  /**
   * 
   */
  clearUpdated() {
    this.#updated = false;
  }

  /** @type {boolean} */
  get dirty() {
    return this.#updated || (this.#parent?.dirty ?? false);
  }

  /** @type {boolean} */
  get directDirty() {
    return this.#updated || (this.#directParent?.directDirty ?? false);
  }

  /** @type {number[]} */
  #directIndexes;
  get directIndexes() {
    if (typeof this.#directIndexes === "undefined") {
      this.#directIndexes = this.#directParent?.directIndexes.concat(this.#index) ?? [this.#index];
    }
    return this.#directIndexes;
  }
  /**
   * 
   */
  clearDirectIndexes() {
    this.#directIndexes = undefined;
  }

  /** @type {number[]} */
  #indexes;
  get indexes() {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.#parent?.indexes.concat(this.#index) ?? [this.#index];
    }
    return this.#indexes;
  }
  /**
   * 
   */
  clearIndexes() {
    this.#indexes = undefined;
  }

  /**
   * 
   * @param {string} name 
   * @param {number} index 
   * @param {LoopContext} parent 
   */
  constructor(name, index, parent) {
    this.#name = name;
    this.#index = index;
    this.#parent = parent;
    const prop = PropertyName.create(name);
    if (prop.level > 0) {
      let curParent = parent;
      while(typeof curParent !== "undefined") {
        if (curParent.name === prop.nearestWildcardParentName) {
          this.#directParent = curParent;
          break;
        }
        curParent = curParent.parent;
      }
    }
  }


  /**
   * 
   * @param {string} name 
   */
  find(name) {
    let loopContext = this;
    while(typeof loopContext !== "undefined") {
      if (loopContext.name === name) return loopContext;
      loopContext = loopContext.directParent;
    }
  }
}