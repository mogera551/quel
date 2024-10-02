import { utils } from "../../utils";
import { IFilterText } from "../../filter/types";
import { IMultiValue, IBinding } from "../types";
import { ElementBase } from "./ElementBase";
import { MultiValue } from "./MultiValue";
import { FilterManager } from "../../filter/Manager";
import { CleanIndexes } from "../../dotNotation/types";

export class Checkbox extends ElementBase {
  get inputElement():HTMLInputElement {
    return this.node as HTMLInputElement;
  }

  _value:IMultiValue = new MultiValue(undefined, false);
  getValue():IMultiValue {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }

  setValue(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Checkbox: ${this.binding.selectorName}.State['${this.binding.stateProperty.name}'] is not array`, );
    const multiValue = this.getFilteredValue();
    this.inputElement.checked = value.some(v => v === multiValue.value);
  }

  _filteredValue:IMultiValue = new MultiValue(undefined, false);
  getFilteredValue() {
    const multiValue:IMultiValue = this.getValue();
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter<"input">(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }

  constructor(binding:IBinding, node:Node, name:string, filters:IFilterText[]) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if ((node as HTMLInputElement).type !== "checkbox") utils.raise("Checkbox: not checkbox");
    super(binding, node, name, filters);
  }

  equals(value:any):boolean {
    return false;
  }
}