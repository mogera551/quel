import { Checkbox } from "../binding/nodeProperty/Checkbox.js";
import { Radio } from "../binding/nodeProperty/Radio.js";
import { utils } from "../utils.js";
import { NodeType } from "./nodeType.js";

const DEFAULT_EVENT = "oninput";
const DEFAULT_EVENT_TYPE = "input";

/** @type {(element:HTMLElement)=>(binding:import("../binding/Binding.js").Binding)=>void} */
const setDefaultEventHandlerByElement = element => binding => 
  element.addEventListener(DEFAULT_EVENT_TYPE, binding.defaultEventHandler);

/**
 * 
 * @param {Node} node
 * @param {boolean} isInputable
 * @param {Binding[]} bindings 
 * @param {string} defaultName
 * @returns {void}
 */
function HTMLElementInitialize(node, isInputable, bindings, defaultName) {
  /** @type {HTMLElement}  */
  const element = node;

  // set event handler
  /** @type {boolean} has default event */
  let hasDefaultEvent = false;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let defaultBinding = null;

  /** @type {import("../binding/nodeProperty/Radio.js").Radio|null} */
  let radioBinding = null;

  /** @type {import("../binding/nodeProperty/Checkbox.js").Checkbox|null} */
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
    } else if (defaultBinding && isInputable) {
      // 以下の条件を満たすと、双方向バインドのためのデフォルトイベントハンドラ（oninput）を設定する
      // ・デフォルト値のバインドがある → イベントが発生しても設定する値がなければダメ
      // ・oninputのイベントがバインドされていない → デフォルトイベント（oninput）が既にバインドされている場合、上書きしない
      // ・nodeが入力系（input, textarea, select） → 入力系に限定
      setDefaultEventHandler(defaultBinding);
    }
  }
}

const thru = () => {};

const nodeInitializerFn = {
  [NodeType.HTMLElement]: HTMLElementInitialize,
  [NodeType.SVGElement]: thru,
  [NodeType.Text]: thru,
  [NodeType.Template]: thru,
};

/**
 * 
 * @type {(nodeInfo:BindNodeInfo)=>(node:Node, bindings:Binding[])=>void}
 */
export const nodeInitializer = (nodeInfo) => (node, bindings) => nodeInitializerFn[nodeInfo.nodeType](node, nodeInfo.isInputable, bindings, nodeInfo.defaultProperty);
