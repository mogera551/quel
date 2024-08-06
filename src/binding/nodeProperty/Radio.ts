import { MultiValue } from "./MultiValue";
import { utils } from "../../utils";
import { ElementBase } from "./ElementBase";
import { FilterInfo, FilterManager } from "../../filter/Manager";
import { Binding } from "../Binding";

export class Radio extends ElementBase {
  get inputElement():HTMLInputElement {
    return this.element as HTMLInputElement;
  }

  /** @type {MultiValue} */
  _value = new MultiValue(undefined, false);
  get value():MultiValue {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }
  set value(value:any) {
    const multiValue:MultiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  _filteredValue = new MultiValue(undefined, false);
  get filteredValue():MultiValue {
    const multiValue:MultiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }
  
  constructor(binding:Binding, node:Node, name:string, filters:FilterInfo[]) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Radio: not htmlInputElement");
    const element = node as HTMLInputElement;
    if (element.type !== "radio" && element.type !== "checkbox") utils.raise("Radio: not radio or checkbox");
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}