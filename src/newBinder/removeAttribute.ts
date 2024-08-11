import { NodeType } from "../@types/binder";

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
  [NodeType.HTMLElement]: removeAttributeFromElement,
  [NodeType.SVGElement]:  removeAttributeFromElement,
  [NodeType.Text]:        thru,
  [NodeType.Template]:    thru,
}

/**
 * remove data-bind attribute from node
 */
export const removeAttribute = (node:Node, nodeType:NodeType):Node => removeAttributeByNodeType[nodeType](node);
