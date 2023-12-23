import "../../types.js";
import { Filter } from "../../filter/Filter.js";
import { MultiValue } from "../nodeProperty/MultiValue.js";
import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../../Symbols.js";
import { utils } from "../../utils.js";

export class ViewModelProperty {
  /** @type { ViewModel } */
  get viewModel() {
    return this.#binding.component.viewModel;
  }

  /** @type { string } */
  #name;
  get name() {
    return this.#name;
  }

  /** @type {PropertyName} */
  get propertyName() {
    return PropertyName.create(this.name);
  }

  /** @type {number[]} */
  get indexes() {
    return this.binding.loopContext?.directIndexes ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  #key;
  get key() {
    return this.name + "\t" + this.indexesString;
  }

  /** @type {any} */
  get value() {
    return this.viewModel[Symbols.directlyGet](this.name, this.indexes);
  }
  set value(value) {
    const setValue = value => {
      this.viewModel[Symbols.directlySet](this.name, this.indexes, value);
    };
    if (value instanceof MultiValue) {
      const thisValue = this.value;
      if (Array.isArray(thisValue)) {
        const setOfThisValue = new Set(thisValue);
        value.enabled ? setOfThisValue.add(value.value) : setOfThisValue.delete(value.value);
        setValue(Array.from(setOfThisValue));
      } else {
        if (value.enabled) {
          setValue(value.value);
        }
      }
    } else {
      setValue(value);
    }
  }

  /** @type {Filter[]} */
  #filters;
  get filters() {
    return this.#filters;
  }

  /** @type {Object<string,FilterFunc>} */
  #filterFuncs;
  get filterFuncs() {
    return this.#filterFuncs;
  }

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForOutput(this.value, this.filters, this.filterFuncs) : this.value;
  }

  /** @type {boolean} applyToViewModel()の対象かどうか */
  get applicable() {
    return true;
  }

  /** @type {import("../Binding.js").Binding} */
  #binding;
  get binding() {
    return this.#binding;
  }

  /**
   * 
   * @param {import("../Binding.js").Binding} binding
   * @param {string} name 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(binding, name, filters, filterFuncs) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  /**
   * このバインドが更新対象かどうか
   * @param {Set<string>} setOfUpdatedViewModelPropertyKeys 
   */
  isUpdate(setOfUpdatedViewModelPropertyKeys) {
    return setOfUpdatedViewModelPropertyKeys.has(this.key) && 
      !this.binding.component.updateSlot.nodeUpdator.queue.has(this);
  }

  assignFromNodeValue() {
    this.value = this.binding.nodeProperty.filteredValue;
  }

  assignValue(value) {
    this.value = value;
  }

  getChildValue(index) {
    return this.viewModel[Symbols.directlyGet](`${this.name}.*` , this.indexes.concat(index));
  }

  setChildValue(index, value) {
    return this.viewModel[Symbols.directlySet](`${this.name}.*` , this.indexes.concat(index), value);
  }
}