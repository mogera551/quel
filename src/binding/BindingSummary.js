import { Symbols } from "../Symbols.js";
import "../types.js";
import { ComponentProperty } from "./nodeProperty/ComponentProperty.js";

export class BindingSummary {

  /** @type {Map<string,Set<Binding>>} */
  #bindingsByKey = new Map;
  get bindingsByKey() {
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} */
  #expandableBindings = new Set;
  get expandableBindings() {
    return this.#expandableBindings;
  }

  /** @type {Set<Binding} */
  #componentBindings = new Set;
  get componentBindings() {
    return this.#componentBindings;
  }

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    const bindings = this.#bindingsByKey.get(binding.viewModelProperty.key);
    if (typeof bindings !== "undefined") {
      bindings.add(binding)
    } else {
      this.#bindingsByKey.set(binding.viewModelProperty.key, new Set([binding]));
    }
    if (binding.nodeProperty.expandable) {
      this.#expandableBindings.add(binding);
    }
    if (binding.nodeProperty.constructor === ComponentProperty) {
      this.#componentBindings.add(binding);
    }
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    const bindings = this.#bindingsByKey.get(binding.viewModelProperty.key);
    if (typeof bindings !== "undefined") {
      bindings.delete(binding);
    }
    this.#expandableBindings.delete(binding);
    this.#componentBindings.delete(binding);
  }
}