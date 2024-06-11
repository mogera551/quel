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

const itsSelf = node => node;

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
 * @returns 
 */
export const replaceTextNode = (node, nodeType) => replaceTextNodeFn[nodeType](node);
