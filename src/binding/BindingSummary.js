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

  #deleteBindings = new Set;
  #allBindings = new Set;

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    this.#allBindings.add(binding);
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
    this.#deleteBindings.add(binding);
  }

  #delete(binding) {
    this.#allBindings.delete(binding);
    const bindings = this.#bindingsByKey.get(binding.viewModelProperty.key);
    if (typeof bindings !== "undefined") {
      bindings.delete(binding);
    }
    this.#expandableBindings.delete(binding);
    this.#componentBindings.delete(binding);
  }

  flush() {
    const remain = this.#allBindings.size - this.#deleteBindings.size;
    if(this.#deleteBindings.size > remain * 10) {
      const bindings = Array.from(this.#allBindings).filter(binding => !this.#deleteBindings.has(binding));
      this.rebuild(bindings);
    } else {
      for(const binding of this.#deleteBindings) {
        this.#delete(binding);
      }
    }
    this.#deleteBindings = new Set;
  }

  rebuild(bindings) {
    this.clear();
    for(const binding of bindings) {
      this.add(binding);
    }
  }

  clear() {
    this.#allBindings = new Set;
    this.#bindingsByKey = new Map;
    this.#expandableBindings = new Set;
    this.#componentBindings = new Set;
  }
}