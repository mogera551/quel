export const NodeType = {
  HTMLElement: 1,
  SVGElement: 2,
  Text: 3,
  Template: 4,
}

export const nodeKey = node => node.constructor.name + "\t" + node.textContent?.[2] ?? "";

const nodeTypeByNodeKey = {};

const getNodeTypeByNode = node =>
  node instanceof Comment && node.textContent?.[2] === ":" ? NodeType.Text : 
  node instanceof HTMLElement ? NodeType.HTMLElement :
  node instanceof Comment && node.textContent?.[2] === "|" ? NodeType.Template : 
  node instanceof SVGElement ? NodeType.SVGElement : NodeType.Unknown;

export const getNodeType = (node) => nodeTypeByNodeKey[nodeKey(node)] ?? (nodeTypeByNodeKey[nodeKey(node)] = getNodeTypeByNode(node));
