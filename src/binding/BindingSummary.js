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

  /** @type {Set<Binding} componentを持つbinding */
  #componentBindings = new Set;
  get componentBindings() {
    return this.#componentBindings;
  }

  /** @type {Set<Binding>} 仮削除用のbinding、flush()でこのbindingの削除処理をする */
  #deleteBindings = new Set;
  /** @type {Set<Binding>} 全binding */
  #allBindings = new Set;
  get allBindings() {
    return this.#allBindings;
  }

  /** @type {Set<Binding>} 更新したbinding */
  #updatedBindings = new Set;
  get updatedBindings() {
    return this.#updatedBindings;
  }

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    if (this.#deleteBindings.has(binding)) {
      this.#deleteBindings.delete(binding);
      return;
    }

    const oldKey = binding.viewModelProperty.oldKey;
    const key = binding.viewModelProperty.getKey();
    console.log("add", binding.id, key, oldKey);
    if (typeof oldKey !== "undefined" && oldKey !== key) {
      console.log("change key", binding.id, key, oldKey);
      this.#bindingsByKey.get(oldKey)?.delete(binding);
      this.#bindingsByKey.get(key)?.add(binding) ?? this.#bindingsByKey.set(key, new Set([binding]));
      return;
    }
    this.#allBindings.add(binding);
    this.#bindingsByKey.get(key)?.add(binding) ?? this.#bindingsByKey.set(key, new Set([binding]));

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
    console.log("delete", binding.id);
    this.#deleteBindings.add(binding);
  }

  /**
   * 
   * @param {Binding} binding 
   */
  #delete(binding) {
    console.log("#delete", binding.id, binding.viewModelProperty.oldKey);
    this.#allBindings.delete(binding);
    this.#bindingsByKey.get(binding.viewModelProperty.oldKey)?.delete(binding);
    this.#expandableBindings.delete(binding);
    this.#componentBindings.delete(binding);
  }

  flush() {
    console.log("flush");
    const remain = this.#allBindings.size - this.#deleteBindings.size;
    if(this.#deleteBindings.size > remain * 10) {
      const bindings = Array.from(this.#allBindings).filter(binding => !this.#deleteBindings.has(binding));
      this.rebuild(bindings);
    } else {
      for(const binding of this.#deleteBindings) {
        this.#delete(binding);
      }
    }
    for(const binding of this.#allBindings) {
      if (binding.viewModelProperty.isChagedKey) {
        this.#bindingsByKey.get(binding.viewModelProperty.oldKey)?.delete(binding);
        const key = binding.viewModelProperty.getKey();
        this.#bindingsByKey.get(key)?.add(binding) ?? this.#bindingsByKey.set(key, new Set([binding]));
      }
    }
    this.#deleteBindings = new Set;
  }

  /**
   * 
   * @param {Binding[]} bindings 
   */
  rebuild(bindings) {
    this.#allBindings = new Set(bindings);
    /** @type {Map<string,Binding[]>} */
    const bindingsByKey = Map.groupBy(bindings, binding => binding.viewModelProperty.key);
    this.#bindingsByKey = new Map(
      Array.from(bindingsByKey.entries()).map(([key, bindings]) => ([key, new Set(bindings)]))
    );
    this.#expandableBindings = new Set(bindings.filter(binding => binding.nodeProperty.expandable));
    this.#componentBindings = new Set(bindings.filter(binding => binding.nodeProperty.constructor === ComponentProperty));
    this.#deleteBindings = new Set;
  }
}