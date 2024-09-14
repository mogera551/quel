import { NodeType } from "./types";

const DATASET_BIND_PROPERTY = 'data-bind';

const removeAttributeFromElement = (node:Node):Node => {
  const element = node as Element;
  element.removeAttribute(DATASET_BIND_PROPERTY);
  return element;
}

const thru = (node:Node):Node => node;

type RemoveAttributeByNodeType = {
  [key in NodeType]: (node:Node)=>Node;
}

const removeAttributeByNodeType:RemoveAttributeByNodeType = {
  HTMLElement: removeAttributeFromElement,
  SVGElement:  removeAttributeFromElement,
  Text:        thru,
  Template:    thru,
}

/**
 * ノードからdata-bind属性を削除
 */
export function removeDataBindAttribute(
  node: Node, 
  nodeType: NodeType
): Node {
  return removeAttributeByNodeType[nodeType](node);
}
