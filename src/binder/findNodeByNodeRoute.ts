import { NodeRoute } from "./types";

/**
 * ノードのルート（道順）インデックスの配列からノードを探す
 */
export const findNodeByNodeRoute = (node: Node, nodeRoute: NodeRoute): Node => {
  for(let i = 0 ; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};
