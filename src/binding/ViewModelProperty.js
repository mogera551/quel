import "../types.js";
import { Filter } from "../filter/Filter.js";
import { MultiValue } from "./nodePoperty/MultiValue.js";
import { PropertyName } from "../../modules/dot-notation/dot-notation.js";
import { Symbols } from "../Symbols.js";
import { utils } from "../utils.js";

export class ViewModelProperty {
  /** @type { ViewModel } */
  #viewModel;
  get viewModel() {
    return this.#viewModel;
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

  /** @type {ContextInfo} */
  #context;
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
    this.#contextParam = undefined;
  }

  /** @type {ContextParam} コンテキスト情報 */
  #contextParam;
  /** @type {ContextParam} コンテキスト情報 */
  get contextParam() {
    const propName = this.propertyName;
    if (typeof this.#contextParam === "undefined" && propName.level > 0) {
      this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
    }
    return this.#contextParam;
  }

  /** @type {number[]} */
  get indexes() {
    return this.contextParam?.indexes ?? [];
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

  /**
   * 
   * @param {ViewModel} viewModel 
   * @param {string} name 
   * @param {ContextInfo} context 
   * @param {Filter[]} filters 
   * @param {Object<string,FilterFunc>} filterFuncs
   */
  constructor(viewModel, name, context, filters, filterFuncs) {
    this.#viewModel = viewModel;
    this.#name = name;
    this.#context = context;
    this.#filters = filters;
    this.#filterFuncs = filterFuncs;
  }

  /**
   * 初期化処理
   * 特に何もしない
   * @param {import("../Binding.js").Binding} binding
   */
  initialize(binding) {
  }
}