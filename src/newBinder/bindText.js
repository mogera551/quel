import { getByUUID } from "../component/Template.js";
import { NodeType } from "./nodeType.js";

const BIND_DATASET = "bind";

/** @typedef {(node:Node)=>string} BindTextFn */

/** @type {BindTextFn} get text to bind from data-bind attribute */
const getBindTextFromHTMLElement = node => node.dataset[BIND_DATASET] ?? "";
/** @type {BindTextFn} get text to bind from data-bind attribute */
const getBindTextFromSVGElement = node => node.dataset[BIND_DATASET] ?? "";
/** @type {BindTextFn} get text to bind from textContent property */
const getBindTextFromText = node => node.textContent.slice(3) ?? "";
/** @type {BindTextFn} get text to bind from template's data-bind attribute, looking up by textContent property */
const getBindTextFromTemplate = node => getByUUID(node.textContent.slice(3) ?? "")?.dataset[BIND_DATASET] ?? "";

/** @type {Object<NodeType,BindTextFn>} */
const getBindTextByNodeType = {
  [NodeType.HTMLElement]: getBindTextFromHTMLElement,
  [NodeType.SVGElement]:  getBindTextFromSVGElement,
  [NodeType.Text]:        getBindTextFromText,
  [NodeType.Template]:    getBindTextFromTemplate,
}

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {string}
 */
export const getBindText = (node, nodeType) => getBindTextByNodeType[nodeType](node);
