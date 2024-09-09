import { NodeRoute } from "./types";

/**
 * find node by node route
 */
export const findNodeByNodeRoute = (node: Node, nodeRoute: NodeRoute): Node => {
  for(let i = 0 ; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};
