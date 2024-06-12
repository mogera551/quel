import { NodeType } from "./nodeType.js";

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const replaceTextNodeText = (node) => {
  const textNode = document.createTextNode("");
  node.parentNode.replaceChild(textNode, node);
  return textNode;
}

/**
 * 
 * @param {Node} node 
 * @returns {Node}
 */
const itsSelf = node => node;

/** @type {Object<NodeType,(node:Node)=>Node>} */
const replaceTextNodeFn = {
  [NodeType.Text]: replaceTextNodeText,
  [NodeType.HTMLElement]: itsSelf,
  [NodeType.SVGElement]: itsSelf,
  [NodeType.Template]: itsSelf,
}

/**
 * 
 * @param {Node} node 
 * @param {NodeType} nodeType 
 * @returns {Node}
 */
export const replaceTextNode = (node, nodeType) => replaceTextNodeFn[nodeType](node);
