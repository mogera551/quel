import { Checkbox } from "../binding/nodeProperty/Checkbox.js";
import { Radio } from "../binding/nodeProperty/Radio.js";
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
function InitializeHTMLElement(node, isInputable, bindings, defaultName) {
  /** @type {HTMLElement}  */
  const element = node;

  // set event handler
  /** @type {boolean} has default event */
  let hasDefaultEvent = false;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let defaultBinding = null;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let radioBinding = null;

  /** @type {import("../binding/Binding.js").Binding|null} */
  let checkboxBinding = null;

  for(let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    hasDefaultEvent ||= binding.nodeProperty.name === DEFAULT_EVENT;
    radioBinding = (binding.nodeProperty.constructor === Radio) ? binding : radioBinding;
    checkboxBinding = (binding.nodeProperty.constructor === Checkbox) ? binding : checkboxBinding;
    defaultBinding = (binding.nodeProperty.name === defaultName) ? binding : defaultBinding;
  }

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
  return undefined;
}

/** @type {()=>void} */
const thru = () => {};

/** @type {{[key:NodeType]:(node:Node, isInputable:boolean, bindings:Binding[], defaultName:string)=>void}} */
const InitializeNodeByNodeType = {
  [NodeType.HTMLElement]: InitializeHTMLElement,
  [NodeType.SVGElement]:  thru,
  [NodeType.Text]:        thru,
  [NodeType.Template]:    thru,
};

/**
 * Initialize node created from template.importNode
 * @type {(nodeInfo:BindNodeInfo)=>(node:Node, bindings:Binding[])=>void}
 */
export const InitializeNode = (nodeInfo) => (node, bindings) => InitializeNodeByNodeType[nodeInfo.nodeType](node, nodeInfo.isInputable, bindings, nodeInfo.defaultProperty);
