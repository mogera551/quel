import "../types.js";
import { utils } from "../utils.js";
import * as BindToDom from "./BindToDom.js";
import { Radio } from "../binding/nodeProperty/Radio.js";
import { Checkbox } from "../binding/nodeProperty/Checkbox.js";

const moduleName = "BindToHTMLElement";

const DATASET_BIND_PROPERTY = "data-bind";
const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = DEFAULT_EVENT.slice(2);
const DEFAULT_PROPERTY = "textContent";

/**
 * 
 * @param {Node} node 
 * @returns {HTMLElement}
 */
const toHTMLElement = node => (node instanceof HTMLElement) ? node : utils.raise(`${moduleName}: not HTMLElement`);

const defaultPropertyByElementType = {
  "radio": "checked",
  "checkbox": "checked",
  "button": "onclick",
}

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */
const getDefaultPropertyFn = element => 
  element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLButtonElement ? "onclick" : 
  element instanceof HTMLAnchorElement ? "onclick" : 
  element instanceof HTMLFormElement ? "onsubmit" : 
  element instanceof HTMLInputElement ? (defaultPropertyByElementType[element.type] ?? "value") :
  DEFAULT_PROPERTY;

/** @type {Object<string,string>} */
const defaultPropertyByKey = {};

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {HTMLElement} element 
 * @returns {string}
 */

const getDefaultProperty = element => {
  const key = element.constructor.name + "\t" + (element.type ?? "");
  const defaultProperty = defaultPropertyByKey[key];
  if (typeof defaultProperty !== "undefined") return defaultProperty;
  return defaultPropertyByKey[key] = getDefaultPropertyFn(element);
}


/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));


/** @type {(element:HTMLElement)=>(binding:import("../binding/Binding.js").Binding)=>void} */
const setDefaultEventHandlerByElement = element => binding => 
  element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);


/**
 * バインドを実行する（ノードがHTMLElementの場合）
 * デフォルトイベントハンドラの設定を行う
 * @param {import("../binding/Binding.js").BindingManager} bindingManager
 * @param {SelectedNode} selectedNode 
 * @returns {import("../binding/Binding.js").Binding[]}
 */
export function bind(bindingManager, selectedNode) {
  /** @type {Node} */
  const node = selectedNode.node;
  /** @type {ViewModel} */
  const viewModel = bindingManager.component.viewModel;
  /** @type {HTMLElement}  */
  const element = toHTMLElement(node);
  /** @type {string} */
  const bindText = element.getAttribute(DATASET_BIND_PROPERTY) ?? undefined;
  (typeof bindText === "undefined") && utils.raise(`${moduleName}: data-bind is not defined`);
  element.removeAttribute(DATASET_BIND_PROPERTY);
  /** @type {string} */
  const defaultName = getDefaultProperty(element);

  // パース
  /** @type {import("../binding/Binding.js").Binding[]} */
  const bindings = BindToDom.parseBindText(bindingManager, selectedNode, viewModel, bindText, defaultName);

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

  if (!hasDefaultEvent) {
    /** @type {(binding:import("../binding/Binding.js").Binding)=>void} */
    const setDefaultEventHandler = setDefaultEventHandlerByElement(element);

    if (radioBinding) {
      setDefaultEventHandler(radioBinding);
    } else if (checkboxBinding) {
      setDefaultEventHandler(checkboxBinding);
    } else if (defaultBinding && isInputableElement(node)) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
  
  }
  return bindings;
}
