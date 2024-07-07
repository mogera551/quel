import { utils } from "../utils.js";

export const NodeType = {
  HTMLElement: 1,
  SVGElement: 2,
  Text: 3,
  Template: 4,
}

/** @type {(node:Node)=>string} */
const createNodeKey = node => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent[2] ?? "") : "");

/** @type {Object<string,NodeType>} */
export const nodeTypeByNodeKey = {};

/** @type {(node:Node)=>NodeType} */
const getNodeTypeByNode = node =>
  node instanceof Comment && node.textContent[2] === ":" ? NodeType.Text : 
  node instanceof HTMLElement ? NodeType.HTMLElement :
  node instanceof Comment && node.textContent[2] === "|" ? NodeType.Template : 
  node instanceof SVGElement ? NodeType.SVGElement : utils.raise(`Unknown NodeType: ${node.nodeType}`);

/**
 * get node type
 * @param {Node} node
 * @returns {NodeType}
 */
export const getNodeType = (node, nodeKey = createNodeKey(node)) => 
  nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
