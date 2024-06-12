export const NodeType = {
  HTMLElement: 1,
  SVGElement: 2,
  Text: 3,
  Template: 4,
}

/** @type {(node:Node)=>string} */
const nodeKey = node => node.constructor.name + "\t" + node.textContent?.[2] ?? "";

/** @type {Object<string,NodeType>} */
const nodeTypeByNodeKey = {};

/** @type {Object<NodeType,(node:Node)=>NodeType>} */
const getNodeTypeByNode = node =>
  node instanceof Comment && node.textContent?.[2] === ":" ? NodeType.Text : 
  node instanceof HTMLElement ? NodeType.HTMLElement :
  node instanceof Comment && node.textContent?.[2] === "|" ? NodeType.Template : 
  node instanceof SVGElement ? NodeType.SVGElement : NodeType.Unknown;

/**
 * 
 * @param {Node} node
 * @returns {NodeType}
 */
export const getNodeType = (node) => nodeTypeByNodeKey[nodeKey(node)] ?? (nodeTypeByNodeKey[nodeKey(node)] = getNodeTypeByNode(node));
