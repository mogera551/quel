import "../types.js";
import { utils } from "../utils.js";
import { Symbols } from "../Symbols.js";
import { PropertyName, RE_CONTEXT_INDEX } from "../../modules/dot-notation/dot-notation.js";
import { Filter } from "../filter/Filter.js";

export class BindInfo {
  /** @type {Node} バインドするDOMノード */
  #node;
  /** @type {Node} バインドするDOMノード */
  get node() {
    return this.#node;
  }
  set node(node) {
    this.#node = node;
  }
  /** @type {Element} */
  get element() {
    return (this.node instanceof Element) ? this.node : utils.raise("not Element");
  }
  /** @type {HTMLElement} */
  get htmlElement() {
    return (this.node instanceof HTMLElement) ? this.node : utils.raise("not HTMLElement");
  }
  /** @type {SVGElement} */
  get svgElement() {
    return (this.node instanceof SVGElement) ? this.node : utils.raise("not SVGElement");
  }

  /** @type {string} バインドするDOMノードのプロパティ名 */
  #nodeProperty;
  /** @type {string} バインドするDOMノードのプロパティ名 */
  get nodeProperty() {
    return this.#nodeProperty;
  }
  set nodeProperty(value) {
    this.#nodeProperty = value;
  }

  /** @type {string[]} バインドするDOMノードのプロパティ要素配列 */
  #nodePropertyElements;
  /** @type {string[]} バインドするDOMノードのプロパティ要素配列 */
  get nodePropertyElements() {
    return this.#nodePropertyElements;
  }
  set nodePropertyElements(value) {
    this.#nodePropertyElements = value;
  }

  /** @type {Component} 親コンポーネント */
  component;

  /** @type {ViewModel} バインドするViewModelオブジェクト */
  viewModel;

  /** @type {string} バインドするViewModelオブジェクトのプロパティ名 */
  #viewModelProperty;

  /** @type {string} バインドするViewModelオブジェクトのプロパティ名 */
  get viewModelProperty() {
    return this.#viewModelProperty;
  }
  set viewModelProperty(value) {
    this.#viewModelProperty = value;

    this.#viewModelPropertyName = undefined;
    this.#isContextIndex = undefined;
    this.#contextIndex = undefined;
    this.#contextParam = undefined;
  }

  /** @type {PropertyName} バインドするViewModelオブジェクトのプロパティ情報 */
  #viewModelPropertyName;
  /** @type {PropertyName} バインドするViewModelオブジェクトのプロパティ情報 */
  get viewModelPropertyName() {
    if (typeof this.#viewModelPropertyName === "undefined") {
      this.#viewModelPropertyName = PropertyName.create(this.#viewModelProperty);
    }
    return this.#viewModelPropertyName;
  }

  /** @type {number} */
  #contextIndex;
  /** @type {number} */
  get contextIndex() {
    if (typeof this.#contextIndex === "undefined") {
      if (this.isContextIndex === true) {
        this.#contextIndex = Number(this.viewModelProperty.slice(1)) - 1;
      }
    }
    return this.#contextIndex;
  }

  /** @type {boolean} バインドするViewModelオブジェクトのプロパティが*/
  #isContextIndex;
  /** @type {boolean} */
  get isContextIndex() {
    if (typeof this.#isContextIndex === "undefined") {
      this.#isContextIndex = (RE_CONTEXT_INDEX.exec(this.viewModelProperty)) ? true : false;
    }
    return this.#isContextIndex;
  }

  /** @type {Filter[]} 適用するフィルター情報の配列 */
  filters;

  /** @type {ContextParam} コンテキスト情報 */
  #contextParam;
  /** @type {ContextParam} コンテキスト情報 */
  get contextParam() {
    if (typeof this.#contextParam === "undefined") {
      const propName = this.viewModelPropertyName;
      if (propName.level > 0) {
        this.#contextParam = this.context.stack.find(param => param.propName.name === propName.nearestWildcardParentName);
      }
    }
    return this.#contextParam;
  }

  /** @type {number[]} */
  get indexes() {
    return this.contextParam?.indexes ?? [];
  }

  /** @type {string} */
  get indexesString() {
    return this.indexes.toString();
  }

  /** @type {string} */
  get viewModelPropertyKey() {
    return this.viewModelProperty + "\t" + this.indexesString;
  }

  /** @type {number[]} */
  get contextIndexes() {
    return this.context.indexes;
  }
  
  /** @type {ContextInfo} */
  #context;
  /** @type {ContextInfo} */
  get context() {
    return this.#context;
  }
  set context(value) {
    this.#context = value;
    this.#contextParam = undefined;
  }

  /** @type {string} */
  eventType;
  
  /** @type {(event:Event)=>void} */
  defaultEventHandler;

  /** @type {string} */
  defaultEventType;

  /** @type {any} */
  get viewModelValue() {
    return (this.isContextIndex) ?
      this.contextIndexes[this.contextIndex] :
      this.viewModel[Symbols.directlyGet](this.viewModelProperty, this.indexes);
  }
  set viewModelValue(value) {
    if (!this.isContextIndex) {
      this.viewModel[Symbols.directlySet](this.viewModelProperty, this.indexes, value);
    }
  }

  /** @type {any} */
  get filteredViewModelValue() {
    return this.filters.length > 0 ? 
      Filter.applyForOutput(this.viewModelValue, this.filters, this.component.filters.out) : 
      this.viewModelValue;
  }
  set filteredViewModelValue(value) {
    this.viewModelValue = this.filters.length > 0 ? Filter.applyForInput(value, this.filters, this.component.filters.in) : value;
  }

  /** @type {any} */
  get nodeValue() {

  }
  set nodeValue(value) {
    
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
   * ToDo:名前を変えたほうが良い
   */
  removeFromParent() {}
}