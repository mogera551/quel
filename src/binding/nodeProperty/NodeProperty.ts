import { utils } from "../../utils";
import { FilterManager, Filters } from "../../filter/Manager";
import { FilterFunc, FilterType, IFilterInfo } from "../../filter/types";
import { IBinding, IPropertyAccess } from "../types";

export class NodeProperty {
  #node:Node;
  get node():Node {
    return this.#node;
  }

  #name:string;
  get name():string {
    return this.#name;
  }

  #nameElements:string[];
  get nameElements() {
    return this.#nameElements;
  }

  get value():(any|undefined) {
    return Reflect.get(this.node, this.name);
  }
  set value(value:any) {
    Reflect.set(this.node, this.name, value);
  }

  #filters:FilterFunc[];
  get filters() {
    return this.#filters;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter<FilterType.Input>(this.value, this.filters);
  }

  // applyToNode()の対象かどうか
  get applicable():boolean {
    return true;
  }

  #binding:IBinding;
  get binding() {
    return this.#binding;
  }

  get expandable():boolean {
    return false;
  }

  get isSelectValue():boolean {
    return false;
  }

  get loopable():boolean {
    return false;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = Filters.create<FilterType.Input>(filters.toReversed(), binding.component.inputFilterManager);
  }

  assign(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    const workFilters = filters.slice(0)
    workFilters.reverse();
    this.#filters = Filters.create<FilterType.Input>(workFilters, binding.component.inputFilterManager);
    return this;
  }

  initialize() {
  }

  postUpdate(propertyAccessByViewModelPropertyKey:Map<string,IPropertyAccess>) {
  }

  isSameValue(value:any):boolean {
    return this.value === value;
  }

  applyToChildNodes(setOfIndex:Set<number>) {
  }

  dispose() {
  }
}