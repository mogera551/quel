import { utils } from "../../utils";
import { FilterFunc, IFilterText } from "../../filter/types";
import { FilterManager, Filters } from "../../filter/Manager";
import { IBinding, INodeProperty, IPropertyAccess } from "../types";

export class NodeProperty implements INodeProperty {
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

  // setValueToNode()の対象かどうか
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

  get revisionForLoop(): number {
    return utils.raise("not loopable");
  }

  get loopable(): boolean {
    return false;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filters = Filters.create<"input">(filters, this.binding.inputFilterManager);
  }

  initialize() {
  }

  postUpdate(propertyAccessByStatePropertyKey:Map<string,IPropertyAccess>) {
  }

  equals(value:any):boolean {
    return this.value === value;
  }

  applyToChildNodes(setOfIndex:Set<number>) {
  }

  dispose() {
  }

  revisionUpForLoop(): number {
    return 0;
  }
}