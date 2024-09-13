import { NodeRoute } from "./types";

/**
 * 最上位ノードからのルート（道順）インデックスの配列を計算する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 */
export function computeNodeRoute(
  node: Node
): NodeRoute {
  let routeIndexes: NodeRoute = [];
  while(node.parentNode !== null) {
    routeIndexes = [ (Array.from(node.parentNode.childNodes) as Node[]).indexOf(node), ...routeIndexes ];
    node = node.parentNode;
  }
  return routeIndexes;
};
