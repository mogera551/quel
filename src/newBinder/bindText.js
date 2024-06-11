import { getByUUID } from "../component/Template.js";
import { NodeType } from "./nodeType.js";

const BIND_DATASET = "bind";

/** @typedef {(node:Node)=>string} BindTextFn */

/** @type {BindTextFn} */
const getBindTextFromHTMLElement = node => node.dataset[BIND_DATASET] ?? "";
/** @type {BindTextFn} */
const getBindTextFromSVGElement = node => node.dataset[BIND_DATASET] ?? "";
/** @type {BindTextFn} */
const getBindTextFromText = node => node.textContent.slice(3) ?? "";
/** @type {BindTextFn} */
const getBindTextFromTemplate = node => getByUUID(node.textContent.slice(3) ?? "")?.dataset[BIND_DATASET] ?? "";

/** @type {Object<NodeType,BindTextFn>} */
const getBindTextFnByNodeType = {
  [NodeType.HTMLElement]: getBindTextFromHTMLElement,
  [NodeType.SVGElement]: getBindTextFromSVGElement,
  [NodeType.Text]: getBindTextFromText,
  [NodeType.Template]: getBindTextFromTemplate,
}

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {string}
 */
export const getBindText = (node, nodeType) => getBindTextFnByNodeType[nodeType](node);
