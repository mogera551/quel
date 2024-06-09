import { config } from "../Config.js";
import { Symbols } from "../Symbols.js";
import "../types.js";
import { ComponentProperty } from "./nodeProperty/ComponentProperty.js";

/** @type {(binding: Binding) => string} */
const pickKey = (binding) => binding.viewModelProperty.key;

/** @type {(binding: Binding) => boolean} */
const filterExpandableBindings = (binding) => binding.nodeProperty.expandable;

/** @type {(binding: Binding) => boolean} */
const filerComponentBindings = (binding) => binding.nodeProperty.constructor === ComponentProperty;

/**
 * BindingSummary
 */
export class BindingSummary {
  /** @type {boolean} */
  #updated = false;
  get updated() {
    return this.#updated;
  }
  set updated(value) {
    this.#updated = value;
  }

  /** @type {number} */
  #updateRevision = 0;
  get updateRevision() {
    return this.#updateRevision;
  }

  /** @type {Map<string,Binding[]>} viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す */
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
   */
  initUpdate() {
    this.#updated = false;
    this.#updateRevision++;
    this.#updatedBindings = new Set;
  }
  
  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    this.#updated = true;
    if (this.#deleteBindings.has(binding)) {
      this.#deleteBindings.delete(binding);
      return;
    }
    this.#allBindings.add(binding);
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    this.#updated = true;
    this.#deleteBindings.add(binding);
  }

  /**
   * 
   */
  flush() {
    config.debug && performance.mark('BindingSummary.flush:start');
    try {
      if (!this.#updated) {
        return;
      }
      const bindings = Array.from(this.#allBindings).filter(binding => !this.#deleteBindings.has(binding));
      this.rebuild(bindings);
    } finally {
      if (config.debug) {
        performance.mark('BindingSummary.flush:end')
        performance.measure('BindingSummary.flush', 'BindingSummary.flush:start', 'BindingSummary.flush:end');
        console.log(performance.getEntriesByType("measure"));    
        performance.clearMeasures('BindingSummary.flush');
        performance.clearMarks('BindingSummary.flush:start');
        performance.clearMarks('BindingSummary.flush:end');
      }

    }
  }

  /**
   * 
   * @param {Binding[]} bindings 
   */
  rebuild(bindings) {
    this.#allBindings = new Set(bindings);
    this.#bindingsByKey = Map.groupBy(bindings, pickKey);
    this.#expandableBindings = new Set(bindings.filter(filterExpandableBindings));
    this.#componentBindings = new Set(bindings.filter(filerComponentBindings));
    this.#deleteBindings = new Set;
  }
}