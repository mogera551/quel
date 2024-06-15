import { NodeType } from "./nodeType.js";

const DEFAULT_PROPERTY = "textContent";

const defaultPropertyByElementType = {
  "radio": "checked",
  "checkbox": "checked",
  "button": "onclick",
}

/**
 * HTML要素のデフォルトプロパティを取得
 * @param {Node} node
 * @param {HTMLElement|undefined} element 
 * @returns {string}
 */
const getDefaultPropertyHTMLElement = (node, element = node) => 
  element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement || element instanceof HTMLOptionElement ? "value" : 
  element instanceof HTMLButtonElement ? "onclick" : 
  element instanceof HTMLAnchorElement ? "onclick" : 
  element instanceof HTMLFormElement ? "onsubmit" : 
  element instanceof HTMLInputElement ? (defaultPropertyByElementType[element.type] ?? "value") :
  DEFAULT_PROPERTY;

/** @type {Object<string,string>} cache */
const defaultPropertyByKey = {};

/** @type {(node:Node)=>string} */
const undefinedProperty = node => undefined;
/** @type {(node:Node)=>string} */
const textContentProperty = node => DEFAULT_PROPERTY;

/** @type {Object<NodeType,(node:Node)=>string>} */
const getDefaultPropertyByNodeType = {
  [NodeType.HTMLElement]: getDefaultPropertyHTMLElement,
  [NodeType.SVGElement]:  undefinedProperty,
  [NodeType.Text]:        textContentProperty,
  [NodeType.Template]:    undefinedProperty,
}

/**
 * get html element's default property
 * @param {Node} node 
 * @param {NodeType} nodeTYpe
 * @returns {string}
 */
export const getDefaultProperty = (node, nodeType) => {
  const key = node.constructor.name + "\t" + (node.type ?? ""); // type attribute
  return defaultPropertyByKey[key] ?? (defaultPropertyByKey[key] = getDefaultPropertyByNodeType[nodeType](node));
}
  