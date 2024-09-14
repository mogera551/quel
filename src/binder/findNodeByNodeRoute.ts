import { NodeRoute } from "./types";

/**
 * ノードのルート（道順）インデックスの配列からノードを探す
 */
export function findNodeByNodeRoute(
  node: Node, 
  nodeRoute: NodeRoute
): Node | undefined {
  for(let i = 0 ; (typeof node !== "undefined") && (i < nodeRoute.length); node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};
