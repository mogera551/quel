import "../types.js";
import { utils } from "../utils.js";
import { BindToDom } from "./BindToDom.js";
import { Radio } from "../binding/nodeProperty/Radio.js";
import { Checkbox } from "../binding/nodeProperty/Checkbox.js";

const DATASET_BIND_PROPERTY = "data-bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`not HTMLElement`);

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultProperty = element => {
  return element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLButtonElement ? "onclick" : 
  element instanceof HTMLInputElement ? ((element.type === "radio" || element.type === "checkbox") ? "checked" : (element.type === "button" ? "onclick" : "value")) : 
  DEFAULT_PROPERTY;
  
};

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || node instanceof HTMLInputElement);


export class BindToHTMLElement {
  /**
   * バインドを実行する（ノードがHTMLElementの場合）
   * デフォルトイベントハンドラの設定を行う
   * @param {import("../binding/Binding.js").BindingManager} bindingManager
   * @param {Node} node 
   * @returns {import("../binding/Binding.js").Binding[]}
   */
  static bind(bindingManager, node) {
    /** @type {ViewModel} */
    const viewModel = bindingManager.component.viewModel;
    /** @type {HTMLElement}  */
    const element = toHTMLElement(node);
    /** @type {string} */
    const bindText = element.getAttribute(DATASET_BIND_PROPERTY);
    /** @type {string} */
    const defaultName = getDefaultProperty(element);

    // パース
    /** @type {import("../binding/Binding.js").Binding[]} */
    const bindings = BindToDom.parseBindText(bindingManager, node, viewModel, bindText, defaultName);

    // イベントハンドラ設定
    /** @type {boolean} デフォルトイベントを設定したかどうか */
    let hasDefaultEvent = false;

    /** @type {import("../binding/Binding.js").Binding|null} */
    let defaultBinding = null;

    /** @type {import("../binding/Radio.js").Radio|null} */
    let radioBinding = null;

    /** @type {import("../binding/Checkbox.js").Checkbox|null} */
    let checkboxBinding = null;

    bindings.forEach(binding => {
      hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
      radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
      checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
      defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
    });

    /** @type {(binding:import("../binding/Binding.js").Binding)=>void} */
    const setDefaultEventHandler = (binding) => {
      element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);
    }
    if (radioBinding) {
      setDefaultEventHandler(radioBinding);
    } else if (checkboxBinding) {
      setDefaultEventHandler(checkboxBinding);
    } else if (defaultBinding && !hasDefaultEvent && isInputableElement(node)) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
    return bindings;
  }
}
