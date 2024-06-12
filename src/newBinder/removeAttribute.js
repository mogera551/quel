import { NodeType } from "./nodeType.js";

const DATASET_BIND_PROPERTY = 'data-bind';

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const removeAttributeFromElement = (node) => {
  /** @type {Element} */
  const element = node;
  element.removeAttribute(DATASET_BIND_PROPERTY);
  return element;
}

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const thru = (node) => node;

/** @type {Object<NodeType,(node:Node)=>Node>} */
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
