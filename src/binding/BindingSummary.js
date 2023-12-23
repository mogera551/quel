import { Symbols } from "../Symbols.js";
import "../types.js";
import { ComponentProperty } from "./nodeProperty/ComponentProperty.js";

/**
 * BindingSummary
 */
export class BindingSummary {

  /** @type {Map<string,Set<Binding>>} viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す */
  #bindingsByKey = new Map;
  get bindingsByKey() {
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} if/loopを持つbinding */
  #expandableBindings = new Set;
  get expandableBindings() {
    return this.#expandableBindings;
  }

  /** @type {Set<Binding>} select.valueを持つbinding */
  #selectBindings = new Set;
  get selectBindings() {
    return this.#selectBindings;
  }

  /** @type {Set<Binding} componentを持つbinding */
  #componentBindings = new Set;
  get componentBindings() {
    return this.#componentBindings;
  }

  /** @type {Set<Binding>} 仮削除用のbinding、flush()でこのbindingの削除処理をする */
  #deleteBindings = new Set;
  /** @type {Set<Binding>} 全binding */
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
    if (binding.nodeProperty.node.constructor === HTMLSelectElement && binding.nodeProperty.name === "value") {
      this.#selectBindings.add(binding);
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
    this.#selectBindings.delete(binding);
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
    this.#selectBindings = new Set;
    this.#componentBindings = new Set;
  }
}