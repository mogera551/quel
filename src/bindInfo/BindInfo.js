import "../types.js";
import  { utils } from "../utils.js";
import { Symbols } from "../viewModel/Symbols.js";
import { PropertyName, RE_CONTEXT_INDEX } from "../../modules/dot-notation/dot-notation.js";

export class BindInfo {
  /**
   * @type {Node}
   */
  #node;
  get node() {
    return this.#node;
  }
  set node(node) {
    this.#node = node;
  }
  /**
   * @type {HTMLElement}
   */
  get element() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /**
   * @type {string}
   */
  #nodeProperty;
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(value) {
    this.#nodeProperty = value;
  }

  /**
   * @type {string[]}
   */
  #nodePropertyElements;
  get nodePropertyElements() {
    return this.#nodePropertyElements;
  }
  set nodePropertyElements(value) {
    this.#nodePropertyElements = value;
  }

  /**
   * @type {import("../component/Component.js").Component} 
   */
  component;
  /**
   * @type {ViewModel}
   */
  viewModel;
  /**
   * @type {string}
   */
  #viewModelProperty;
  get viewModelProperty() {
    return this.#viewModelProperty;
  }
  set viewModelProperty(value) {
    this.#viewModelProperty = value;

    this.#viewModelPropertyName = undefined;
    this.#isContextIndex = undefined;
    this.#contextIndex = undefined;
    this.#contextParam = undefined;
    this.#indexes = undefined;
    this.#indexesString = undefined;
    this.#viewModelPropertyKey = undefined;
  }
  /**
   * @type {import("../../modules/dot-notation/dot-notation.js").PropertyName}
   */
  #viewModelPropertyName;
  get viewModelPropertyName() {
    if (typeof this.#viewModelPropertyName === "undefined") {
      this.#viewModelPropertyName = PropertyName.create(this.#viewModelProperty);
    }
    return this.#viewModelPropertyName;
  }
  /**
   * @type {number}
   */
  #contextIndex;
  get contextIndex() {
    if (typeof this.#contextIndex === "undefined") {
      if (this.isContextIndex === true) {
        this.#contextIndex = Number(this.viewModelProperty.slice(1)) - 1;
      }
    }
    return this.#contextIndex;
  }
  /**
   * @type {boolean}
   */
  #isContextIndex;
  get isContextIndex() {
    if (typeof this.#isContextIndex === "undefined") {
      this.#isContextIndex = (RE_CONTEXT_INDEX.exec(this.viewModelProperty)) ? true : false;
    }
    return this.#isContextIndex;
  }
  /**
   * @type {import("../filter/Filter.js").Filter[]}
   */
  filters;

  #contextParam;
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = this.viewModelPropertyName;
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      }
    }
    return this.#contextParam;
  }

  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    if (typeof this.#indexes === "undefined") {
      this.#indexes = this.contextParam?.indexes ?? [];
    }
    return this.#indexes;
  }
  set indexes(value) {
//    this.#indexes = value;
//    this.#indexesString = value.toString();
//    this.#viewModelPropertyKey = this.#viewModelProperty + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    if (typeof this.#indexesString === "undefined") {
      this.#indexesString = this.indexes.toString();
    }
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    if (typeof this.#viewModelPropertyKey === "undefined") {
      this.#viewModelPropertyKey = this.viewModelProperty + "\t" + this.indexesString;
    }
    return this.#viewModelPropertyKey;
  }
  /**
   * @type {number[]}
   */
  get contextIndexes() {
    return this.context.indexes;
  }
  
  /**
   * @type {any}
   */
  lastNodeValue;
  /**
   * @type {any}
   */
  lastViewModelValue;

  /**
   * @type {ContextInfo}
   */
  context;

  /**
   * 
   * @returns {any}
   */
  getViewModelValue() {
    return (this.isContextIndex) ?
      this.contextIndexes[this.contextIndex] :
      this.viewModel[Symbols.directlyGet](this.viewModelProperty, this.indexes);
  }

  /**
   * 
   * @param {any} value
   */
  setViewModelValue(value) {
    if (!this.isContextIndex) {
      this.viewModel[Symbols.directlySet](this.viewModelProperty, this.indexes, value);
    }
  }

  /**
   * ViewModelのプロパティの値をNodeのプロパティへ反映する
   */
  updateNode() {}

  /**
   * nodeのプロパティの値をViewModelのプロパティへ反映する
   */
  updateViewModel() {}

  /**
   * 
   * @param {PropertyName} propName 
   * @param {number} diff 
   */
  changeIndexes(propName, diff) {
  }

  /**
   * 
   */
  removeFromParent() { }
}