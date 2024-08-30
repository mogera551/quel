import { utils } from "../../utils";
import { FilterFunc, IFilterInfo } from "../../@types/filter";
import { FilterManager, Filters } from "../../filter/Manager";
import { INewBinding, INewNodeProperty, INewPropertyAccess } from "../../@types/binding";

export class NodeProperty implements INewNodeProperty {
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
    return this.filters.length === 0 ? this.value : FilterManager.applyFilter<"input">(this.value, this.filters);
  }

  // applyToNode()の対象かどうか
  get applicable():boolean {
    return true;
  }

  #binding:INewBinding;
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

  constructor(binding:INewBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = Filters.create<"input">(filters, this.binding.inputFilterManager);
  }

  initialize() {
  }

  postUpdate(propertyAccessByStatePropertyKey:Map<string,INewPropertyAccess>) {
  }

  equals(value:any):boolean {
    return this.value === value;
  }

  applyToChildNodes(setOfIndex:Set<number>) {
  }

  dispose() {
  }
}