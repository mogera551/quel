/**
 * is the node a comment node for template or text ?
 * @param {Node} node 
 * @returns {boolean}
 */
const isCommentNode = node => node instanceof Comment && (node.textContent.startsWith("@@:") || node.textContent.startsWith("@@|"));

/**
 * get comment nodes for template or text
 * @param {Node} node 
 * @returns {Comment[]}
 */
export const getCommentNodes = node => Array.from(node.childNodes).flatMap(node => getCommentNodes(node).concat(isCommentNode(node) ? node : []));
