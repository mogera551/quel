import { NodeRoute } from "../@types/types";

/**
 * get indexes of childNodes from root node to the node 
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 */
export const computeNodeRoute = (node:Node):number[] => {
  let routeIndexes:number[] = [];
  while(node.parentNode !== null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node as ChildNode), ...routeIndexes ];
    node = node.parentNode;
  }
  return routeIndexes;
};

/**
 * find node by node route
 */
export const findNodeByNodeRoute = (node:Node, nodeRoute:NodeRoute):Node => {
  for(let i = 0 ; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};
