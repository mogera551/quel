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


export const getNodeFromNodeRoute = (rootNode, nodeRoute) => {
  let currentNode = rootNode;
  for(const routeIndex of nodeRoute) {
    currentNode = currentNode.childNodes[routeIndex];
  }
  return currentNode;
}