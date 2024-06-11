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
export const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : []));
