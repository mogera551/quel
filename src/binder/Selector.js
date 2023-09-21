const SELECTOR = "[data-bind]";

/**
 * ルートノードから、ノードまでのchileNodesのインデックスリストを取得する
 * ex.
 * rootNode.childNodes[1].childNodes[3].childNodes[7].childNodes[2]
 * => [1,3,7,2]
 * @param {Node} node 
 * @returns {number[]}
 */
const getNodeRoute = node => {
  /** @type {number[]} */
  let routeIndexes = [];
  while(node.parentNode != null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node) ].concat(routeIndexes);
    node = node.parentNode;
  }
  return routeIndexes;
};

/**
 * ルートのインデックス配列からノード取得する
 * @param {Node} node 
 * @param {number[]} routeIndexes 
 * @returns {Node}
 */
const getNodeByRouteIndexes = (node, routeIndexes) => {
  for(let i = 0; i < routeIndexes.length; i++) {
    node = node.childNodes[routeIndexes[i]];
  }
  return node;
}

/**
 * ノードがコメントかどうか
 * @param {Node} node 
 * @returns {boolean}
 */
const isCommentNode = node => node instanceof Comment && (node.textContent.startsWith("@@:") || node.textContent.startsWith("@@|"));

/**
 * コメントノードを取得
 * @param {Node} node 
 * @returns {Comment[]}
 */
const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : null)).filter(node => node);

export class Selector {
  /** @type {Map<HTMLTemplateElement, number[][]>} */
  static listOfRouteIndexesByTemplate = new Map();

  /**
   * テンプレートからバインドする対象のノードを取得する
   * @param {HTMLTemplateElement} template 
   * @param {HTMLElement} rootElement
   * @returns {Node[]}
   */
  static getTargetNodes(template, rootElement) {

    /** @type {Node[]} */
    let nodes;

    if (this.listOfRouteIndexesByTemplate.has(template)) {
      // キャッシュがある場合
      // querySelectorAllを行わずにNodeの位置を特定できる
      /** @type {number[][]} */
      const listOfRouteIndexes = this.listOfRouteIndexesByTemplate.get(template);
      nodes = listOfRouteIndexes.map(routeIndexes => getNodeByRouteIndexes(rootElement, routeIndexes));
    } else {
      // data-bind属性を持つエレメント、コメント（内容が@@で始まる）のノードを取得しリストを作成する
      nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));

      // ノードのルート（DOMツリーのインデックス番号の配列）をキャッシュに覚えておく
      this.listOfRouteIndexesByTemplate.set(template, nodes.map(node => getNodeRoute(node)));
    }
    return nodes;

  }

}

