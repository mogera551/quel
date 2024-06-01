import "../../types.js";
import { Filter } from "../../filter/Filter.js";
import { MultiValue } from "../nodeProperty/MultiValue.js";
import { PropertyName } from "../../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../../Symbols.js";

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
  #propertyName;
  get propertyName() {
    return this.#propertyName;
  }

  #level;
  get level() {
    return this.#level;
  }

  /** @type {number[]} */
  get indexes() {
    return this.binding.loopContext?.indexes.slice(0 , this.level) ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  get key() {
    return this.name + "\t" + this.indexesString;
  }

  #oldKey;
  get oldKey() {
    return this.#oldKey;
  }

  get isChagedKey() {
    return this.#oldKey !== this.key;
  }

  getKey() {
    this.#oldKey = this.key;
    return this.key;
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
        setValue(value.enabled ? value.value : undefined);
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

  /** @type {any} */
  get filteredValue() {
    return this.filters.length > 0 ? Filter.applyForOutput(this.value, this.filters) : this.value;
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
   */
  constructor(binding, name, filters) {
    this.#binding = binding;
    this.#name = name;
    this.#filters = filters;
    this.#propertyName = PropertyName.create(this.name);
    this.#level = this.#propertyName.level;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize() {
  }

  getChildValue(index) {
    return this.viewModel[Symbols.directlyGet](`${this.name}.*` , this.indexes.concat(index));
  }

  setChildValue(index, value) {
    return this.viewModel[Symbols.directlySet](`${this.name}.*` , this.indexes.concat(index), value);
  }
}