import { utils } from "../../utils";
import { FilterType, IFilterInfo } from "../../@types/filter";
import { IBinding, IMultiValue } from "../../@types/binding";
import { MultiValue } from "./MultiValue";
import { ElementBase } from "./ElementBase";
import { FilterManager } from "../../filter/Manager";

export class Radio extends ElementBase {
  get inputElement():HTMLInputElement {
    return this.element as HTMLInputElement;
  }

  _value:IMultiValue = new MultiValue(undefined, false);
  get value():IMultiValue {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }
  set value(value:any) {
    const multiValue:IMultiValue = this.filteredValue;
    this.inputElement.checked = (value === multiValue.value) ? true : false;
  }

  _filteredValue:IMultiValue = new MultiValue(undefined, false);
  get filteredValue():IMultiValue {
    const multiValue:IMultiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter<FilterType.Input>(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }
  
  constructor(binding:IBinding, node:Node, name:string, filters:IFilterInfo[]) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Radio: not htmlInputElement");
    const element = node as HTMLInputElement;
    if (element.type !== "radio" && element.type !== "checkbox") utils.raise("Radio: not radio or checkbox");
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}