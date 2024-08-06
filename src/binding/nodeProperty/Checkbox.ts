import { ElementBase } from "./ElementBase";
import { MultiValue } from "./MultiValue";
import { utils } from "../../utils.js";
import { FilterManager } from "../../filter/Manager";
import { Binding } from "../Binding";
import { FilterInfo } from "../../filter/Manager";

export class Checkbox extends ElementBase {
  get inputElement():HTMLInputElement {
    return this.node as HTMLInputElement;
  }

  _value:MultiValue = new MultiValue(undefined, false);
  get value():MultiValue {
    this._value.value = this.inputElement.value;
    this._value.enabled = this.inputElement.checked;
    return this._value;
  }

  set value(value:any[]) {
    if (!Array.isArray(value)) utils.raise(`Checkbox: ${this.binding.component.selectorName}.ViewModel['${this.binding.viewModelProperty.name}'] is not array`, );
    const multiValue = this.filteredValue;
    this.inputElement.checked = value.some(v => v === multiValue.value);
  }

  _filteredValue:MultiValue = new MultiValue(undefined, false);
  get filteredValue() {
    const multiValue:MultiValue = this.value;
    this._filteredValue.value = this.filters.length > 0 ? FilterManager.applyFilter(multiValue.value, this.filters) : multiValue.value;
    this._filteredValue.enabled = multiValue.enabled;
    return this._filteredValue;
  }

  constructor(binding:Binding, node:Node, name:string, filters:FilterInfo[]) {
    if (!(node instanceof HTMLInputElement)) utils.raise("Checkbox: not htmlInputElement");
    if ((node as HTMLInputElement).type !== "checkbox") utils.raise("Checkbox: not checkbox");
    super(binding, node, name, filters);
  }

  isSameValue(value:any):boolean {
    return false;
  }
}