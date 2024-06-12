/**
 * ルートノードから、ノードまでのchileNodesのインデックスリストを取得する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param {Node} node 
 * @returns {number[]}
 */
export const getNodeRoute = node => {
  /** @type {number[]} */
  let routeIndexes = [];
  while(node.parentNode !== null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node), ...routeIndexes ];
    node = node.parentNode;
  }
  return routeIndexes;
};

//const routeFn = (node, routeIndex) => node.childNodes[routeIndex];
//export const getNodeFromNodeRoute = (rootNode, nodeRoute) => nodeRoute.reduce(routeFn, rootNode);
/**
 * 
 * @param {Node} node 
 * @param {NodeRoute} nodeRoute 
 * @returns {Node}
 */
export const getNodeFromNodeRoute = (node, nodeRoute) => {
  for(let i = 0 ; i < nodeRoute.length; node = node.childNodes[nodeRoute[i++]]) ;
  return node;
};
