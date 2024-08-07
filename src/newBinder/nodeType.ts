import { utils } from "../utils";
import { NodeType } from "./types";

const createNodeKey = (node:Node):string => node.constructor.name + "\t" + ((node instanceof Comment) ? (node.textContent?.[2] ?? "") : "");

type NodeTypeByNodeKey = {
  [nodeKey:string]:NodeType;
};

export const nodeTypeByNodeKey:NodeTypeByNodeKey = {};

const getNodeTypeByNode = (node:Node):NodeType =>
  (node instanceof Comment && node.textContent?.[2] === ":") ? NodeType.Text : 
  (node instanceof HTMLElement) ? NodeType.HTMLElement :
  (node instanceof Comment && node.textContent?.[2] === "|") ? NodeType.Template : 
  (node instanceof SVGElement) ? NodeType.SVGElement : utils.raise(`Unknown NodeType: ${node.nodeType}`);

export const getNodeType = (node:Node, nodeKey = createNodeKey(node)) => 
  nodeTypeByNodeKey[nodeKey] ?? (nodeTypeByNodeKey[nodeKey] = getNodeTypeByNode(node));
