import { NodeType } from "./nodeType.js";

/**
 * ユーザー操作によりデフォルト値が変わるかどうか
 * getDefaultPropertyと似ているが、HTMLOptionElementを含まない
 * @param { Node } node
 * @returns { boolean }
 */
const isInputableHTMLElement = node => node instanceof HTMLElement && 
  (node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement || (node instanceof HTMLInputElement && node.type !== "button"));

const falsey = node => false;

const isInputableFn = {
  [NodeType.HTMLElement]: isInputableHTMLElement,
  [NodeType.SVGElement]: falsey,
  [NodeType.Text]: falsey,
  [NodeType.Template]: falsey,
}

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {boolean}
 */
export const isInputable = (node, nodeType) => isInputableFn[nodeType](node);