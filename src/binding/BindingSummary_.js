import { config } from "../Config.js";
import { Symbols } from "../Symbols_.js";
import "../types_.js";
import { utils } from "../utils.js";
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

  #updating = false;

  /** @type {number} */
  #updateRevision = 0;
  get updateRevision() {
    return this.#updateRevision;
  }

  /** @type {Map<string,Binding[]>} viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す */
  #bindingsByKey = new Map; // Object<string,Binding[]>：16ms、Map<string,Binding[]>：9.2ms
  get bindingsByKey() {
    if (this.#updating) utils.raise("BindingSummary.bindingsByKey can only be called after BindingSummary.update()");
    return this.#bindingsByKey;
  }

  /** @type {Set<Binding>} if/loopを持つbinding */
  #expandableBindings = new Set;
  get expandableBindings() {
    if (this.#updating) utils.raise("BindingSummary.expandableBindings can only be called after BindingSummary.update()");
    return this.#expandableBindings;
  }

  /** @type {Set<Binding} componentを持つbinding */
  #componentBindings = new Set;
  get componentBindings() {
    if (this.#updating) utils.raise("BindingSummary.componentBindings can only be called after BindingSummary.update()");
    return this.#componentBindings;
  }

  /** @type {Set<Binding>} 全binding */
  #allBindings = new Set;
  get allBindings() {
    return this.#allBindings;
  }

  /**
   * 
   * @param {Binding} binding 
   */
  add(binding) {
    if (!this.#updating) utils.raise("BindingSummary.add() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.add(binding);
  }

  /**
   * 
   * @param {Binding} binding 
   */
  delete(binding) {
    if (!this.#updating) utils.raise("BindingSummary.delete() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.delete(binding);
  }

  exists(binding) {
    return this.#allBindings.has(binding);
  }
  /**
   * 
   */
  flush() {
    config.debug && performance.mark('BindingSummary.flush:start');
    try {
      this.rebuild(this.#allBindings);
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
   * @param {(summary:BindingSummary)=>any} callback 
   */
  update(callback) {
    this.#updating = true;
    this.#updated = false;
    this.#updateRevision++;
    try {
      callback(this);
    } finally {
      if (this.#updated) this.flush();
      this.#updating = false;
    }
  }

  /**
   * 
   * @param {Set<Binding>} bindings 
   */
  rebuild(bindings) {
    this.#allBindings = bindings;
    const arrayBindings = Array.from(bindings);
    this.#bindingsByKey = Map.groupBy(arrayBindings, pickKey);
    this.#expandableBindings = new Set(arrayBindings.filter(filterExpandableBindings));
    this.#componentBindings = new Set(arrayBindings.filter(filerComponentBindings));
  }
}