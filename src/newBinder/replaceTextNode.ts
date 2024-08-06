import { utils } from "../utils";
import { NodeType } from "./types";

const replaceTextNodeText = (node:Node):Node => {
  const textNode = document.createTextNode("");
  node.parentNode?.replaceChild(textNode, node);
  return textNode;
}

const itsSelf = (node:Node):Node => node;

const raiseError = (node:Node) => (utils.raise(`Unknown NodeType: ${node.constructor.name}`), node);

type ReplaceTextNodeFn = {
  [key in NodeType]: (node:Node)=>Node;
}

const replaceTextNodeFn:ReplaceTextNodeFn = {
  [NodeType.Text]:        replaceTextNodeText,
  [NodeType.HTMLElement]: itsSelf,
  [NodeType.SVGElement]:  itsSelf,
  [NodeType.Template]:    itsSelf,
  [NodeType.Unknown]:     raiseError,
}

/**
 * replace comment node to text node
 */
export const replaceTextNode = (node:Node, nodeType:NodeType):Node => replaceTextNodeFn[nodeType](node);
