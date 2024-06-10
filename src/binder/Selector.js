import { utils } from "../utils.js";

const moduleName = "Selector";

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
  while(node.parentNode !== null) {
    routeIndexes = [ Array.from(node.parentNode.childNodes).indexOf(node) ].concat(routeIndexes);
    node = node.parentNode;
  }
  return routeIndexes;
};

/** @type {(node:Node,routeIndex:number)=>Node} */
const reduceNodeByRouteIndex = (node, routeIndex) => node.childNodes[routeIndex];

/**
 * ルートのインデックス配列からノード取得する
 * @type {(node:Node)=>(routeIndexes:number[])=>Node}
 */
const routeIndexesToNodeFromRootNode = node => routeIndexes => routeIndexes.reduce(reduceNodeByRouteIndex, node);
/*
const routeIndexesToNodeFromRootNode = node => routeIndexes => {
  let currentNode = node;
  for(const routeIndex of routeIndexes) {
    currentNode = currentNode.childNodes[routeIndex];
  }
  return currentNode;
};
*/
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

/**
 * @typedef {Object} RouteInfo
 * @property {number[]} routeIndexes
 * @property {string} key // uuid + routeIndexes.join(",")
 */

/** @type {Object<string,RouteInfo[]>} */
const listOfRouteInfoByUUID = {};

/** @type {(node:Node,template:HTMLTemplateElement)=>(routeInfo:RouteInfo)=>SelectedNode} */
const routeInfoToSelectedNodeFromRootNodeAndUUID = 
  (node, uuid) => routeInfo => ({ 
    uuid, 
    routeIndexes: routeInfo.routeIndexes, 
    node: routeIndexesToNodeFromRootNode(node)(routeInfo.routeIndexes),
    key: routeInfo.key
  });

/**
 * Get target node list from template
 * @param {HTMLTemplateElement|undefined} template 
 * @param {string} uuid
 * @param {HTMLElement|undefined} rootElement
 * @returns {SelectedNode[]}
 */
export function getTargetNodes(template, uuid, rootElement) {
  (typeof template === "undefined") && utils.raise(`${moduleName}: template is undefined`);
  (typeof rootElement === "undefined") && utils.raise(`${moduleName}: rootElement is undefined`);

  /** @type {RouteInfo[]} */
  const listOfRouteInfo = listOfRouteInfoByUUID[uuid];
  if (typeof listOfRouteInfo !== "undefined") {
    // キャッシュがある場合
    // querySelectorAllを行わずにNodeの位置を特定できる
    const routeInfoToSelectedNode = routeInfoToSelectedNodeFromRootNodeAndUUID(rootElement, uuid);
    return listOfRouteInfo.map(routeInfoToSelectedNode);
  } else {
    // data-bind属性を持つエレメント、コメント（内容が@@で始まる）のノードを取得しリストを作成する
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));
    const { selectedNodes, listOfRouteInfo } = nodes.reduce(({ selectedNodes, listOfRouteInfo }, node) => {
      const routeIndexes = getNodeRoute(node);
      const key = uuid + "\t" + routeIndexes.join(",");
      selectedNodes.push({ node, routeIndexes, uuid, key });
      listOfRouteInfo.push({ routeIndexes, key });
      return { selectedNodes, listOfRouteInfo };
    }, { 
      /** @type {SelectedNode[]} */ selectedNodes:[], 
      /** @type {RouteInfo[]} */ listOfRouteInfo:[] 
    });

    // ノードのルート（DOMツリーのインデックス番号の配列）をキャッシュに覚えておく
    listOfRouteInfoByUUID[uuid] = listOfRouteInfo;
    return selectedNodes;
  }
}
