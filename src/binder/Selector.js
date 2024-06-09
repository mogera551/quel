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

/** @type {Object<string,number[][]>} */
const listOfRouteIndexesByUUID = {};

/** @type {(node:Node,template:HTMLTemplateElement)=>(routeIndexes:number[])=>SelectedNode} */
const routeIndexesToSelectedNodeFromRootNodeAndUUID = 
  (node, uuid) => routeIndexes => ({ uuid, routeIndexes, node:routeIndexesToNodeFromRootNode(node)(routeIndexes) });

/**
 * Get target node list from template
 * @param {HTMLTemplateElement|undefined} template 
 * @param {HTMLElement|undefined} rootElement
 * @returns {SelectedNode[]}
 */
export function getTargetNodes(template, rootElement) {
  (typeof template === "undefined") && utils.raise(`${moduleName}: template is undefined`);
  (typeof rootElement === "undefined") && utils.raise(`${moduleName}: rootElement is undefined`);
  /** @type {string} */
  const uuid = template.dataset["uuid"];
  (typeof uuid === "undefined" || uuid === "") && utils.raise(`${moduleName}: uuid is undefined`);

  /** @type {number[][]} */
  const listOfRouteIndexes = listOfRouteIndexesByUUID[uuid];
  if (typeof listOfRouteIndexes !== "undefined") {
    // キャッシュがある場合
    // querySelectorAllを行わずにNodeの位置を特定できる
    const routeIndexesToSelectedNode = routeIndexesToSelectedNodeFromRootNodeAndUUID(rootElement, uuid);
    return listOfRouteIndexes.map(routeIndexesToSelectedNode);
  } else {
    // data-bind属性を持つエレメント、コメント（内容が@@で始まる）のノードを取得しリストを作成する
    const nodes = Array.from(rootElement.querySelectorAll(SELECTOR)).concat(getCommentNodes(rootElement));
    const { selectedNodes, listOfRouteIndexes } = nodes.reduce(({ selectedNodes, listOfRouteIndexes }, node) => {
      const routeIndexes = getNodeRoute(node);
      selectedNodes.push({ node, routeIndexes, uuid });
      listOfRouteIndexes.push(routeIndexes);
      return { selectedNodes, listOfRouteIndexes };
    }, { 
      /** @type {SelectedNode[]} */ selectedNodes:[], 
      /** @type {number[][]} */ listOfRouteIndexes:[] 
    });

    // ノードのルート（DOMツリーのインデックス番号の配列）をキャッシュに覚えておく
    listOfRouteIndexesByUUID[uuid] = listOfRouteIndexes;
    return selectedNodes;
  }
}
