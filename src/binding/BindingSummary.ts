import { utils } from "../utils";
import { config } from "../Config";
import { ComponentProperty } from "./nodeProperty/ComponentProperty";
import { IBinding, IBindingSummary } from "../@types/binding";

const pickKey = (binding:IBinding):string => binding.stateProperty.key;
const filterExpandableBindings = (binding:IBinding):boolean => binding.nodeProperty.expandable;
const filerComponentBindings = (binding:IBinding):boolean => binding.nodeProperty.constructor === ComponentProperty;

/**
 * BindingSummary
 */
class BindingSummary implements IBindingSummary {
  #updated:boolean = false;
  get updated() {
    return this.#updated;
  }
  set updated(value) {
    this.#updated = value;
  }

  #updating = false;

  #updateRevision:number = 0;
  get updateRevision():number {
    return this.#updateRevision;
  }

  // viewModelキー（プロパティ名＋インデックス）からbindingのリストを返す 
  #bindingsByKey:Map<string, IBinding[]> = new Map; // Object<string,Binding[]>：16ms、Map<string,Binding[]>：9.2ms
  get bindingsByKey():Map<string, IBinding[]> {
    if (this.#updating) utils.raise("BindingSummary.bindingsByKey can only be called after BindingSummary.update()");
    return this.#bindingsByKey;
  }

  // if/loopを持つbinding
  #expandableBindings:Set<IBinding> = new Set;
  get expandableBindings():Set<IBinding> {
    if (this.#updating) utils.raise("BindingSummary.expandableBindings can only be called after BindingSummary.update()");
    return this.#expandableBindings;
  }

  // componentを持つbinding
  #componentBindings:Set<IBinding> = new Set;
  get componentBindings():Set<IBinding> {
    if (this.#updating) utils.raise("BindingSummary.componentBindings can only be called after BindingSummary.update()");
    return this.#componentBindings;
  }

  // 全binding
  #allBindings:Set<IBinding> = new Set;
  get allBindings():Set<IBinding> {
    return this.#allBindings;
  }

  add(binding:IBinding) {
    if (!this.#updating) utils.raise("BindingSummary.add() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.add(binding);
  }

  delete(binding:IBinding) {
    if (!this.#updating) utils.raise("BindingSummary.delete() can only be called in BindingSummary.update()");
    this.#updated = true;
    this.#allBindings.delete(binding);
  }

  exists(binding:IBinding):boolean {
    return this.#allBindings.has(binding);
  }

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

  update(callback:(summary:IBindingSummary)=>any):void {
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

  rebuild(bindings:Set<IBinding>):void {
    this.#allBindings = bindings;
    const arrayBindings = Array.from(bindings);
    this.#bindingsByKey = Map.groupBy(arrayBindings, pickKey) as Map<string,IBinding[]>;
    this.#expandableBindings = new Set(arrayBindings.filter(filterExpandableBindings));
    this.#componentBindings = new Set(arrayBindings.filter(filerComponentBindings));
  }
}

export function createBindingSummary():IBindingSummary {
  return new BindingSummary;
}