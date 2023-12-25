import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

export class LoopContext {
  /** @type {LoopContext} */
  get parent() {
    return this.#bindingManager.parentBinding?.loopContext;
  }

  /** @type {LoopContext|undefined} */
  #directParent;
  get directParent() {
    if (typeof this.parent !== "undefined" && typeof this.#directParent === "undefined") {
      const prop = PropertyName.create(this.name);
      if (prop.level > 0) {
        let parent = this.parent;
        while(typeof parent !== "undefined") {
          if (parent.name === prop.nearestWildcardParentName) {
            this.#directParent = parent;
            break;
          }
          parent = parent.parent;
        }
      }
    }
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
    return this.#updated || (this.parent?.dirty ?? false);
  }

  /** @type {boolean} */
  get directDirty() {
    return this.#updated || (this.directParent?.directDirty ?? false);
  }

  /** @type {number[]} */
  #directIndexes;
  get directIndexes() {
    if (typeof this.#directIndexes === "undefined") {
      this.#directIndexes = this.directParent?.directIndexes.concat(this.#index) ?? [this.#index];
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
      this.#indexes = this.parent?.indexes.concat(this.#index) ?? [this.#index];
    }
    return this.#indexes;
  }
  /**
   * 
   */
  clearIndexes() {
    this.#indexes = undefined;
  }

  clear() {
    this.clearDirectIndexes();
    this.clearIndexes();
    this.#directParent = undefined;
  }

  /** @param {import("../binding/Binding.js").BindingManager} */
  #bindingManager;
  get bindingManager() {
    return this.#bindingManager;
  } 
  set bindingManager(value) {
    this.#bindingManager = value;
  } 
    
  /**
   * 
   * @param {import("../binding/Binding.js").BindingManager} bindingManager 
   * @param {string} name 
   * @param {number} index 
   */
  constructor(bindingManager, name, index) {
    this.#bindingManager = bindingManager;
    this.#name = name;
    this.#index = index;
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