import "../types.js";
import  { utils } from "../utils.js";
import { Symbols } from "../viewModel/Symbols.js";
import { dotNotation } from "../../modules/imports.js";

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
   * @type {BindInfo}
   */
  contextBind;
  /**
   * @type {BindInfo}
   */
  parentContextBind;
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
    this.#viewModelPropertyName = dotNotation.PropertyName.create(value);
    if (dotNotation.RE_CONTEXT_INDEX.exec(value)) {
      this.#contextIndex = Number(value.slice(1)) - 1;
    } else {
      this.#contextIndex = undefined;
    }
  }
  /**
   * @type {import("../../modules/dot-notation/dot-notation.js").PropertyName}
   */
  #viewModelPropertyName;
  get viewModelPropertyName() {
    return this.#viewModelPropertyName;
  }
  /**
   * @type {number}
   */
  #contextIndex;
  get contextIndex() {
    return this.#contextIndex;
  }
  /**
   * @type {boolean}
   */
  get isContextIndex() {
    return (typeof this.#contextIndex !== "undefined");
  }
  /**
   * @type {import("../filter/Filter.js").Filter[]}
   */
  filters;

  /**
   * @type {number[]}
   */
  #indexes;
  get indexes() {
    return this.#indexes;
  }
  set indexes(value) {
    this.#indexes = value;
    this.#indexesString = value.toString();
    this.#viewModelPropertyKey = this.#viewModelProperty + "\t" + this.#indexesString;
  }
  /**
   * @type {string}
   */
  #indexesString;
  get indexesString() {
    return this.#indexesString;
  }
  /**
   * @type {string}
   */
  #viewModelPropertyKey;
  get viewModelPropertyKey() {
    return this.#viewModelPropertyKey;
  }
  /**
   * @type {number[]}
   */
  contextIndexes;
  /**
   * @type {number}
   */
  positionContextIndexes = -1;
  
  /**
   * @type {any}
   */
  lastNodeValue;
  /**
   * @type {any}
   */
  lastViewModelValue;

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
   * @param {BindInfo} target 
   * @param {number} diff 
   */
  changeIndexes(target, diff) {
    const { indexes, contextIndexes } = this;
    if (this.viewModelPropertyName.setOfParentPaths.has(target.viewModelProperty)) {
      indexes[target.indexes.length] = indexes[target.indexes.length] + diff;
    }
    contextIndexes[target.contextIndexes.length] = contextIndexes[target.contextIndexes.length] + diff;
    
 }

  /**
   * 
   */
  removeFromParent() { }
}