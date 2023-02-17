const SELECTOR = "[data-bind]";

/**
 * ルートノードから、nodeまでのchileNodesのインデックスリストを取得する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param {Node} node 
 * @returns {integer[]}
 */
const getNodeRoute = node => {
  let routeIndexes = [];
  while(node.parentNode != null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node) ].concat(routeIndexes);
    node = node.parentNode;
  }
  return routeIndexes;
};


/**
 * 
 * @param {Node} node 
 * @returns 
 */
const isCommentNode = node => node instanceof Comment && node.textContent[0] === "@" && node.textContent[1] === "@" && node.textContent[2] !== "@";
/**
 * 
 * @param {Node} node 
 * @returns 
 */
const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : null)).filter(node => node);

export default class {
  /**
   * @type {Map<HTMLTemplateElement, integer[][]>}
   */
  static listOfRouteIndexesByTemplate = new Map();
  /**
   * 
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement
   * @returns {Node[]}
   */
  static getTargetNodes(template, rootElement) {
    /**
     * @type {Node[]}
     */
    let nodes;

    if (this.listOfRouteIndexesByTemplate.has(template)) {
      // キャッシュがある場合
      // querySelectorAllをせずにNodeの位置を特定できる
      const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
      nodes = listOfRouteIndexes.map(routeIndexes => routeIndexes.reduce((node, routeIndex) => node.childNodes[routeIndex], rootElement));
    } else {
      // data-bindを持つノード、コメントのノードを取得しリストを作成する
      nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));

      // ルートから、nodeのインデックスの順番をキャッシュに覚えておく
      this.listOfRouteIndexesByTemplate.set(template, nodes.map(node => getNodeRoute(node)));
    }
    nodes.sort((node1, node2) => {
      const isSelect1 = node1 instanceof HTMLSelectElement;
      const isSelect2 = node2 instanceof HTMLSelectElement;
      if (isSelect1 || isSelect2) {
        return (!isSelect1 && isSelect2) ? 1 : -1;
      } else {
        return -1;
      }
    });
    return nodes;

  }

}

