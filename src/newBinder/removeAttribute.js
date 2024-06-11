import { NodeType } from "./nodeType.js";

const DATASET_BIND_PROPERTY = 'data-bind';

const removeAttributeFromElement = (node) => {
  /** @type {Element} */
  const element = node;
  element.removeAttribute(DATASET_BIND_PROPERTY);
  return element;
}

const thru = (node) => node;

const removeAttributeFn = {
  [NodeType.HTMLElement]: removeAttributeFromElement,
  [NodeType.SVGElement]: removeAttributeFromElement,
  [NodeType.Text]: thru,
  [NodeType.Template]: thru,
}

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {Node}
 */
export const removeAttribute = (node, nodeType) => removeAttributeFn[nodeType](node);
