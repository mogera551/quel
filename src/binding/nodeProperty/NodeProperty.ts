import { utils } from "../../utils";
import { FilterFunc, IFilterText } from "../../filter/types";
import { FilterManager, Filters } from "../../filter/Manager";
import { IBinding, INodeProperty } from "../types";
import { IStatePropertyAccessor } from "../../state/types";

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

  getValue():(any|undefined) {
    // @ts-ignore
    return this.node[this.name];
//    return Reflect.get(this.node, this.name);
  }
  setValue(value:any) {
    // @ts-ignore
    this.node[this.name] = value;
//    Reflect.set(this.node, this.name, value);
  }

  #filterTexts: IFilterText[];
  #filters?:FilterFunc[];
  get filters(): FilterFunc[] {
    if (typeof this.#filters === "undefined") {
      this.#filters = Filters.create<"input">(this.#filterTexts, this.binding.inputFilterManager);
    }
    return this.#filters;
  }

  /** @type {any} */
  getFilteredValue(): any {
    const value = this.getValue();
    return this.filters.length === 0 ? value : FilterManager.applyFilter<"input">(value, this.filters);
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

  constructor(binding:IBinding, node:Node, name:string, filterTexts:IFilterText[]) {
    if (!(node instanceof Node)) utils.raise("NodeProperty: not Node");
    this.#binding = binding;
    this.#node = node;
    this.#name = name;
    this.#nameElements = name.split(".");
    this.#filterTexts = filterTexts;
  }

  initialize() {
  }

  postUpdate(propertyAccessByStatePropertyKey:Map<string,IStatePropertyAccessor>) {
  }

  equals(value:any):boolean {
    return this.getValue() === value;
  }

  applyToChildNodes(setOfIndex:Set<number>) {
  }

  dispose() {
  }

  revisionUpForLoop(): number {
    return 0;
  }
}