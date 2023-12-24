import { PropertyName } from "../../modules/dot-notation/dot-notation.js";

export class LoopContext {
  /** @type {LoopContext} */
  #parent;
  get parent() {
    return this.#parent;
  }

  /** @type {LoopContext|undefined} */
//  #directParent;
  get directParent() {
    const prop = PropertyName.create(this.name);
    if (prop.level > 0) {
      let curContext = this.bindingManager.parentBinding.loopContext;
      while(typeof curContext !== "undefined") {
        if (curContext.name === prop.nearestWildcardParentName) {
          return curContext;
          break;
        }
        curContext = curContext.bindingManager.parentBinding.loopContext;
      }
    }
    return;
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
    return this.#updated || (this.directParent?.directDirty ?? false);
  }

  /** @type {number[]} */
  // #directIndexes;
  get directIndexes() {
    return this.directParent?.directIndexes.concat(this.#index) ?? [this.#index];
  }
  /**
   * 
   */
  clearDirectIndexes() {
//    this.#directIndexes = undefined;
  }

  /** @type {number[]} */
  #indexes;
  get indexes() {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.#bindingManager.parentBinding?.loopContext?.indexes.concat(this.#index) ?? [this.#index];
    }
    return this.#indexes;
  }
  /**
   * 
   */
  clearIndexes() {
    this.#indexes = undefined;
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